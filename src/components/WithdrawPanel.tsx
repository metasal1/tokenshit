"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useSignAndSendTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { SHIT_SYMBOL } from "@/lib/shit-token";
import { friendlySolanaSendError } from "@/lib/solana-send";
import { sendSponsoredSolanaTx } from "@/lib/sponsor-send";
import { BalanceSkeleton } from "@/components/StatLoader";
import { EmojiIcon } from "@/components/EmojiIcon";
import Link from "next/link";

type Asset = "shit" | "usdc" | "sol";

type Bals = { sol?: number; usdc?: number; shit?: number };

function fmt(n: number | null | undefined, max = 4) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toLocaleString(undefined, { maximumFractionDigits: max });
}

/**
 * Send SOL / USDC / $TOKENSHIT from Privy wallet → any Solana address.
 * Answers “I swapped — how do I withdraw?”
 */
export default function WithdrawPanel({
  defaultAsset = "shit",
  compact = false,
}: {
  defaultAsset?: Asset;
  compact?: boolean;
} = {}) {
  const { ready, authenticated, getAccessToken, user } = usePrivy();
  const { safeLogin } = useSafeLogin();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const from = useMemo(
    () => pickSolanaAddress(wallets, user),
    [wallets, user]
  );

  const [asset, setAsset] = useState<Asset>(defaultAsset);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [bals, setBals] = useState<Bals | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);

  const loadBal = useCallback(() => {
    if (!from) return;
    fetch(`/api/wallet/balances?address=${encodeURIComponent(from)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) =>
        setBals({
          sol: Number(d.sol),
          usdc: Number(d.usdc),
          shit: Number(d.shit ?? d.tokenshit),
        })
      )
      .catch(() => {});
  }, [from]);

  useEffect(() => {
    loadBal();
    const t = setInterval(loadBal, 20_000);
    return () => clearInterval(t);
  }, [loadBal]);

  const bal =
    asset === "sol"
      ? bals?.sol
      : asset === "usdc"
        ? bals?.usdc
        : bals?.shit;

  const symbol =
    asset === "sol" ? "SOL" : asset === "usdc" ? "USDC" : `$${SHIT_SYMBOL}`;

  function setMax() {
    if (bal == null || !Number.isFinite(bal)) return;
    if (asset === "sol") {
      // leave fee dust
      setAmount(Math.max(0, bal - 0.005).toFixed(6).replace(/\.?0+$/, ""));
    } else {
      setAmount(String(bal));
    }
  }

  async function withdraw() {
    setErr(null);
    setSig(null);
    if (!authenticated) {
      safeLogin();
      return;
    }
    if (!from) {
      setErr("Need a Solana wallet linked");
      return;
    }
    const dest = to.trim();
    const amt = Number(amount);
    if (!dest || dest.length < 32) {
      setErr("Paste the Solana address you want to send to");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setErr("Enter an amount");
      return;
    }
    if (bal != null && amt > bal + 1e-9) {
      setErr(`Not enough ${symbol} (you have ${fmt(bal)})`);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/wallet/build-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: dest, asset, amount: amt }),
      });
      const data = await res.json();
      if (!res.ok || !data.transaction) {
        throw new Error(data.error || "Could not build withdraw");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletObj =
        (wallets as any[])?.find((w) => w?.address === from) ||
        (wallets as any[])?.[0];
      if (!walletObj) throw new Error("No wallet object");

      const desc = `Withdraw ${amt} ${symbol} → ${dest.slice(0, 4)}…${dest.slice(-4)}`;
      const { signature } = await sendSponsoredSolanaTx({
        transaction: data.transaction as string,
        wallet: walletObj,
        walletAddress: from,
        signAndSendTransaction,
        description: desc,
        kind: "withdraw",
        solBalance: null,
        allowSelfPayFallback: true,
      });
      if (!signature) throw new Error("No signature from wallet");
      setSig(signature);
      setAmount("");
      loadBal();
      void getAccessToken(); // keep session warm
    } catch (e) {
      setErr(friendlySolanaSendError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="rounded-xl border border-border bg-card h-20 flex items-center justify-center">
        <EmojiIcon size={22} className="animate-spin opacity-80">
          💫
        </EmojiIcon>
      </div>
    );
  }

  return (
    <section
      id="withdraw"
      className={`rounded-xl border border-amber-500/25 bg-card ${
        compact ? "p-3.5" : "p-4 sm:p-5"
      } space-y-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-white font-orbitron tracking-wide uppercase">
            Withdraw
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 leading-snug">
            Send tokens from this app wallet to Phantom, Solflare, or any Solana
            address. Keep a little SOL for fees.
          </p>
        </div>
        <Link
          href="/swap"
          className="shrink-0 text-[10px] font-orbitron uppercase tracking-wider text-neon-blue hover:underline"
        >
          Buy
        </Link>
      </div>

      {!authenticated ? (
        <button
          type="button"
          onClick={() => safeLogin()}
          className="w-full min-h-11 rounded-xl bg-neon text-black font-bold text-sm font-orbitron uppercase"
        >
          Login to withdraw
        </button>
      ) : (
        <>
          <div className="flex gap-1.5">
            {(
              [
                ["shit", `$${SHIT_SYMBOL}`],
                ["usdc", "USDC"],
                ["sol", "SOL"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setAsset(id);
                  setErr(null);
                  setSig(null);
                }}
                className={`flex-1 min-h-10 rounded-lg text-xs font-semibold border transition ${
                  asset === id
                    ? "border-neon/50 bg-neon/15 text-neon"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                }`}
              >
                {label}
                <span className="block text-[10px] font-mono font-normal text-zinc-500 mt-0.5">
                  {bals == null ? (
                    <BalanceSkeleton className="h-3 w-8 inline-block" />
                  ) : (
                    fmt(
                      id === "sol"
                        ? bals.sol
                        : id === "usdc"
                          ? bals.usdc
                          : bals.shit
                    )
                  )}
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-orbitron">
              To Solana address
            </label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value.trim())}
              placeholder="Paste destination wallet…"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon/40"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-orbitron">
                Amount ({symbol})
              </label>
              <button
                type="button"
                onClick={setMax}
                className="text-[10px] font-orbitron uppercase text-neon hover:underline"
              >
                Max
              </button>
            </div>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="0"
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-base font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon/40"
            />
          </div>

          {err && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
              {err}
            </p>
          )}
          {sig && (
            <p className="text-xs text-neon bg-neon/10 border border-neon/30 rounded-lg px-3 py-2">
              Sent.{" "}
              <a
                href={`https://solscan.io/tx/${sig}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-neon-blue"
              >
                View tx
              </a>
            </p>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() => void withdraw()}
            className="w-full min-h-12 rounded-xl bg-neon text-black font-bold text-sm font-orbitron uppercase tracking-wide hover:brightness-110 disabled:opacity-45 inline-flex items-center justify-center gap-2"
          >
            {busy && (
              <EmojiIcon size={16} className="animate-spin" label="Sending">
                💫
              </EmojiIcon>
            )}
            {busy ? "Sending…" : `Withdraw ${symbol}`}
          </button>

          <p className="text-[10px] text-zinc-600 leading-snug">
            This is your in-app Solana wallet. To cash out to an exchange, send
            to a deposit address that supports Solana {symbol === "SOL" ? "SOL" : symbol}.
          </p>
        </>
      )}
    </section>
  );
}
