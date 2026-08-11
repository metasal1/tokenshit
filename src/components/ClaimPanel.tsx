"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  CLAIM_GH_FORK,
  CLAIM_X_VERIFIED,
  SHIT_MINT,
  TREASURY_ADDRESS,
  mintSolscanUrl,
  shitBuyUrl,
  treasurySolscanUrl,
} from "@/lib/shit-token";

function fmt(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function TreasuryBalanceBadge() {
  const [shit, setShit] = useState<number | null>(null);
  const [sol, setSol] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/treasury")
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          if (typeof d.shit === "number") setShit(d.shit);
          if (typeof d.sol === "number") setSol(d.sol);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <a
      href={treasurySolscanUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-300 hover:border-neon hover:text-white transition-colors font-mono"
      title={`Treasury ${TREASURY_ADDRESS}`}
    >
      <span className="text-neon">$SHIT</span>
      <span>{shit == null ? "…" : fmt(shit)}</span>
      {sol != null && sol > 0 && (
        <span className="text-zinc-600">· {sol.toFixed(3)} SOL</span>
      )}
    </a>
  );
}

export default function ClaimPanel() {
  const { ready, authenticated, user, login } = usePrivy();
  const [busy, setBusy] = useState<"x_verified" | "gh_fork" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [treasuryShit, setTreasuryShit] = useState<number | null>(null);

  const twitter = user?.twitter?.username || null;
  const github = user?.github?.username || null;
  const wallet = user?.wallet?.address || null;

  useEffect(() => {
    fetch("/api/treasury")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.shit === "number") setTreasuryShit(d.shit);
      })
      .catch(() => {});
  }, [sig]);

  async function claim(kind: "x_verified" | "gh_fork") {
    setErr(null);
    setMsg(null);
    setSig(null);
    if (!authenticated) {
      login();
      return;
    }
    if (!wallet) {
      setErr("Connect a Solana wallet (Privy creates one on login).");
      return;
    }
    if (kind === "x_verified" && !twitter) {
      setErr("Link X/Twitter in Privy to claim verified airdrop.");
      return;
    }
    if (kind === "gh_fork" && !github) {
      setErr("Link GitHub in Privy to claim fork airdrop.");
      return;
    }

    setBusy(kind);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          wallet,
          twitter,
          github,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || `Claim failed (${res.status})`);
        return;
      }
      setMsg(
        `Sent ${Number(data.amount).toLocaleString()} $SHIT to your wallet.`
      );
      setSig(data.signature || null);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(null);
    }
  }

  if (!ready) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Claim $SHIT</h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-xl">
            One-time treasury drops. Mint{" "}
            <a
              className="text-neon-blue hover:underline font-mono text-xs"
              href={mintSolscanUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              {SHIT_MINT.slice(0, 8)}…{SHIT_MINT.slice(-6)}
            </a>
          </p>
        </div>
        <TreasuryBalanceBadge />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">X verified</span>
            <span className="font-mono text-neon text-sm">
              {CLAIM_X_VERIFIED.toLocaleString()} $SHIT
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Blue / business / gov check on X. Login with Twitter.
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => claim("x_verified")}
            className="w-full rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold py-2 transition-colors"
          >
            {busy === "x_verified"
              ? "Claiming…"
              : authenticated
                ? "Claim X verified"
                : "Login to claim"}
          </button>
          {twitter && (
            <p className="text-[11px] text-zinc-600 font-mono">@{twitter}</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">GH fork</span>
            <span className="font-mono text-neon text-sm">
              {CLAIM_GH_FORK.toLocaleString()} $SHIT
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Fork{" "}
            <a
              href="https://github.com/solana-foundation/tokens"
              className="text-neon-blue hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              solana-foundation/tokens
            </a>
            . Login with GitHub.
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => claim("gh_fork")}
            className="w-full rounded-md bg-zinc-100 hover:bg-white disabled:opacity-50 text-black text-sm font-semibold py-2 transition-colors"
          >
            {busy === "gh_fork"
              ? "Claiming…"
              : authenticated
                ? "Claim GH fork"
                : "Login to claim"}
          </button>
          {github && (
            <p className="text-[11px] text-zinc-600 font-mono">gh/{github}</p>
          )}
        </div>
      </div>

      {treasuryShit != null && treasuryShit < CLAIM_X_VERIFIED && (
        <p className="text-xs text-amber-400">
          Treasury low ({fmt(treasuryShit)} $SHIT). Fund{" "}
          <a
            className="underline font-mono"
            href={treasurySolscanUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            {TREASURY_ADDRESS.slice(0, 4)}…{TREASURY_ADDRESS.slice(-4)}
          </a>{" "}
          before claims pay out.
        </p>
      )}

      {err && <p className="text-sm text-red-400">{err}</p>}
      {msg && <p className="text-sm text-green-400">{msg}</p>}
      {sig && (
        <a
          href={`https://solscan.io/tx/${sig}`}
          className="text-xs text-neon-blue hover:underline font-mono break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          tx {sig}
        </a>
      )}

      <div className="flex flex-wrap gap-3 text-xs pt-1">
        <a
          href={shitBuyUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon-blue hover:underline"
        >
          Buy $SHIT on Jupiter
        </a>
        <a
          href={treasurySolscanUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300"
        >
          Treasury on Solscan
        </a>
      </div>
    </section>
  );
}
