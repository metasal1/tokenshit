"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  SHIT_MINT,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
  X_HANDLE,
  X_URL,
  followIntentUrl,
  mintSolscanUrl,
  shitBuyUrl,
  treasurySolscanUrl,
  tweetTagIntentUrl,
} from "@/lib/shit-token";

type ClaimKind = "x_verified" | "gh_fork" | "x_tweet" | "x_follow";

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
      <span className="text-neon">${SHIT_SYMBOL}</span>
      <span>{shit == null ? "…" : fmt(shit)}</span>
      {sol != null && sol > 0 && (
        <span className="text-zinc-600">· {sol.toFixed(3)} SOL</span>
      )}
    </a>
  );
}

export default function ClaimPanel() {
  const { ready, authenticated, user, login, linkTwitter, linkGithub } =
    usePrivy();
  const [busy, setBusy] = useState<ClaimKind | null>(null);
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

  async function claim(kind: ClaimKind) {
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
    if (
      (kind === "x_verified" || kind === "x_tweet" || kind === "x_follow") &&
      !twitter
    ) {
      setErr("Link X/Twitter to claim this reward.");
      return;
    }
    if (kind === "gh_fork" && !github) {
      setErr("Link GitHub to claim fork airdrop.");
      return;
    }

    setBusy(kind);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, wallet, twitter, github }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || `Claim failed (${res.status})`);
        return;
      }
      setMsg(
        `Sent ${Number(data.amount).toLocaleString()} $${SHIT_SYMBOL} to your wallet.`
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
          <h2 className="text-lg font-bold text-foreground">
            Claim ${SHIT_SYMBOL}
          </h2>
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
        {/* Tweet + tag */}
        <div className="rounded-lg border border-neon/40 bg-neon/5 p-4 space-y-3 sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">Tweet + tag @{X_HANDLE}</span>
            <span className="font-mono text-neon text-sm">
              {CLAIM_X_TWEET.toLocaleString()} ${SHIT_SYMBOL}
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Post a public tweet that tags{" "}
            <a
              href={X_URL}
              className="text-neon-blue hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @{X_HANDLE}
            </a>{" "}
            (last ~7 days). Then claim.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={tweetTagIntentUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center rounded-md border border-zinc-600 hover:border-neon text-sm font-semibold py-2 transition-colors"
            >
              1. Post tweet
            </a>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => claim("x_tweet")}
              className="flex-1 rounded-md bg-neon text-black hover:brightness-110 disabled:opacity-50 text-sm font-semibold py-2 transition"
            >
              {busy === "x_tweet" ? "Checking…" : "2. Claim tweet reward"}
            </button>
          </div>
          {twitter ? (
            <p className="text-[11px] text-zinc-600 font-mono">@{twitter}</p>
          ) : (
            <button
              type="button"
              onClick={() => (authenticated ? linkTwitter() : login())}
              className="text-[11px] text-sky-400 hover:underline"
            >
              Link X first
            </button>
          )}
        </div>

        {/* Follow */}
        <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Follow @{X_HANDLE}</span>
            <span className="font-mono text-neon text-sm">
              {CLAIM_X_FOLLOW.toLocaleString()} ${SHIT_SYMBOL}
            </span>
          </div>
          <p className="text-xs text-zinc-500">Follow on X, then claim once.</p>
          <div className="flex flex-col gap-2">
            <a
              href={followIntentUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center rounded-md border border-zinc-600 hover:border-sky-500 text-sm font-semibold py-2"
            >
              Follow on X
            </a>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => claim("x_follow")}
              className="w-full rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold py-2"
            >
              {busy === "x_follow" ? "Checking…" : "Claim follow"}
            </button>
          </div>
        </div>

        {/* X verified */}
        <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">X verified</span>
            <span className="font-mono text-neon text-sm">
              {CLAIM_X_VERIFIED.toLocaleString()} ${SHIT_SYMBOL}
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Blue / business / gov check on X.
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => claim("x_verified")}
            className="w-full rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold py-2"
          >
            {busy === "x_verified"
              ? "Claiming…"
              : authenticated
                ? "Claim X verified"
                : "Login to claim"}
          </button>
          {twitter ? (
            <p className="text-[11px] text-zinc-600 font-mono">@{twitter}</p>
          ) : (
            <button
              type="button"
              onClick={() => (authenticated ? linkTwitter() : login())}
              className="text-[11px] text-sky-400 hover:underline"
            >
              Link X to claim
            </button>
          )}
        </div>

        {/* GH fork */}
        <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">GH fork</span>
            <span className="font-mono text-neon text-sm">
              {CLAIM_GH_FORK.toLocaleString()} ${SHIT_SYMBOL}
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
            .
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => claim("gh_fork")}
            className="w-full rounded-md bg-zinc-100 hover:bg-white disabled:opacity-50 text-black text-sm font-semibold py-2"
          >
            {busy === "gh_fork"
              ? "Claiming…"
              : authenticated
                ? "Claim GH fork"
                : "Login to claim"}
          </button>
          {github ? (
            <p className="text-[11px] text-zinc-600 font-mono">gh/{github}</p>
          ) : (
            <button
              type="button"
              onClick={() => (authenticated ? linkGithub() : login())}
              className="text-[11px] text-zinc-300 hover:underline"
            >
              Link GitHub to claim
            </button>
          )}
        </div>
      </div>

      {treasuryShit != null && treasuryShit < CLAIM_X_TWEET && (
        <p className="text-xs text-amber-400">
          Treasury low ({fmt(treasuryShit)} ${SHIT_SYMBOL}). Fund{" "}
          <a
            className="underline font-mono"
            href={treasurySolscanUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            {TREASURY_ADDRESS.slice(0, 4)}…{TREASURY_ADDRESS.slice(-4)}
          </a>
          .
        </p>
      )}

      {err && <p className="text-sm text-red-400 break-words">{err}</p>}
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
          className="text-neon-blue hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy ${SHIT_SYMBOL} on Jupiter
        </a>
        <a
          href={treasurySolscanUrl()}
          className="text-zinc-500 hover:text-zinc-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          Treasury on Solscan
        </a>
      </div>
    </section>
  );
}
