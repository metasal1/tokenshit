"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import {
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  GH_FORK_UPSTREAM,
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
import { BalanceSkeleton } from "@/components/StatLoader";
import ShareRefButton from "@/components/ShareRefButton";
import { pickSolanaAddress } from "@/lib/privy-identity";

type ClaimKind = "x_verified" | "gh_fork" | "x_tweet" | "x_follow";

const BTN =
  "w-full min-h-11 touch-manipulation rounded-lg text-sm font-semibold py-3 px-3 transition disabled:opacity-50 active:scale-[0.98]";
const BTN_OUTLINE = `${BTN} border border-zinc-600 hover:border-neon text-white`;
const BTN_NEON = `${BTN} bg-neon text-black hover:brightness-110`;
const BTN_SKY = `${BTN} bg-sky-600 hover:bg-sky-500 text-white`;
const BTN_LIGHT = `${BTN} bg-zinc-100 hover:bg-white text-black`;

function fmt(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function TreasuryBalanceBadge({ className = "" }: { className?: string }) {
  const [shit, setShit] = useState<number | null>(null);
  const [sol, setSol] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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
        .catch(() => {})
        .finally(() => {
          if (alive) setLoading(false);
        });
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
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 min-h-9 rounded-md border border-zinc-700 text-zinc-300 hover:border-neon hover:text-white transition-colors font-mono ${className}`}
      title={`Treasury ${TREASURY_ADDRESS}`}
    >
      <span className="text-neon">${SHIT_SYMBOL}</span>
      {loading || shit == null ? (
        <BalanceSkeleton className="h-3.5 w-12" />
      ) : (
        <span>{fmt(shit)}</span>
      )}
      {loading ? null : sol != null && sol > 0 ? (
        <span className="text-zinc-600 hidden xs:inline sm:inline">
          · {sol.toFixed(3)} SOL
        </span>
      ) : null}
    </a>
  );
}

function RewardRow({
  title,
  amount,
  hint,
  children,
  highlight,
}: {
  title: string;
  amount: number;
  hint: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 sm:p-4 space-y-3 ${
        highlight
          ? "border-neon/50 bg-neon/5"
          : "border-border bg-background/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base text-white leading-snug">
            {title}
          </h3>
          <div className="text-xs text-zinc-500 mt-1 leading-snug">{hint}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-neon text-sm sm:text-base font-bold tabular-nums">
            {amount.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-600 font-mono">${SHIT_SYMBOL}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ClaimPanel() {
  const { ready, authenticated, user, login, getAccessToken, linkTwitter, linkGithub } =
    usePrivy();
  const { wallets } = useWallets();
  const [busy, setBusy] = useState<ClaimKind | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [treasuryShit, setTreasuryShit] = useState<number | null>(null);
  const [tweetUrl, setTweetUrl] = useState("");
  const [claimedStatus, setClaimedStatus] = useState<Record<string, boolean>>({});
  const [statusLoading, setStatusLoading] = useState(false);

  const twitter = user?.twitter?.username || null;
  const github = user?.github?.username || null;
  const wallet = useMemo(
    () => pickSolanaAddress(wallets, user),
    [wallets, user]
  );

  useEffect(() => {
    fetch("/api/treasury")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.shit === "number") setTreasuryShit(d.shit);
      })
      .catch(() => {});
  }, [sig]);

  useEffect(() => {
    if (!authenticated) {
      setClaimedStatus({});
      return;
    }
    setStatusLoading(true);
    const q = new URLSearchParams();
    if (twitter) q.set("twitter", twitter);
    if (github) q.set("github", github);
    if (wallet) q.set("wallet", wallet);
    fetch(`/api/claim/status?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.claimed) setClaimedStatus(d.claimed);
        if (typeof d.treasuryShit === "number") setTreasuryShit(d.treasuryShit);
      })
      .catch(() => {})
      .finally(() => setStatusLoading(false));
  }, [authenticated, twitter, github, wallet, sig]);

  async function claim(kind: ClaimKind) {
    setErr(null);
    setMsg(null);
    setSig(null);
    if (!authenticated) {
      login();
      return;
    }
    if (!wallet) {
      setErr("No Solana wallet yet — wait a second after login, or re-login.");
      return;
    }
    if (
      (kind === "x_verified" || kind === "x_tweet" || kind === "x_follow") &&
      !twitter
    ) {
      setErr("Link X first.");
      return;
    }
    if (kind === "gh_fork" && !github) {
      setErr("Link GitHub first.");
      return;
    }
    if (kind === "x_tweet" && !tweetUrl.trim()) {
      setErr("Paste your tweet URL first.");
      return;
    }

    setBusy(kind);
    try {
      const token = await getAccessToken();
      if (!token) {
        setErr("Session expired — log in again.");
        return;
      }
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-privy-token": token,
        },
        body: JSON.stringify({
          kind,
          wallet,
          twitter,
          github,
          accessToken: token,
          ...(kind === "x_tweet" && tweetUrl.trim()
            ? { tweetUrl: tweetUrl.trim() }
            : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail =
          typeof data.detail === "string"
            ? ` (${data.detail})`
            : data.meta?.errors
              ? ` (${JSON.stringify(data.meta.errors).slice(0, 120)})`
              : "";
        setErr((data.error || `Claim failed (${res.status})`) + detail);
        return;
      }
      setMsg(
        `Sent ${Number(data.amount).toLocaleString()} $${SHIT_SYMBOL} to wallet.`
      );
      setSig(data.signature || null);
      try {
        const handle = (twitter || github || "").replace(/^@/, "") || null;
        window.dispatchEvent(
          new CustomEvent("tokenshit:claim", {
            detail: {
              id: Date.now(),
              kind,
              kindLabel:
                kind === "x_verified"
                  ? "X verified"
                  : kind === "gh_fork"
                    ? "GH fork"
                    : kind === "x_tweet"
                      ? "tweet tag"
                      : "X follow",
              handle,
              twitter: twitter || null,
              github: github || null,
              amount: Number(data.amount) || 0,
              avatarUrl: twitter
                ? `https://unavatar.io/twitter/${encodeURIComponent(twitter)}`
                : null,
              createdAt: new Date().toISOString(),
            },
          })
        );
      } catch {
        /* ignore */
      }
      requestAnimationFrame(() => {
        document
          .getElementById("claim-status")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(null);
    }
  }

  if (!ready) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 animate-pulse h-40" />
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-3.5 sm:p-5 space-y-3 sm:space-y-4">
      {/* Sticky-ish header on mobile */}
      <div className="flex items-center justify-between gap-2 sticky top-0 z-10 -mx-3.5 sm:mx-0 px-3.5 sm:px-0 py-2 sm:py-0 bg-card/95 sm:bg-transparent backdrop-blur sm:backdrop-blur-none border-b border-border/50 sm:border-0">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
            Claim ${SHIT_SYMBOL}
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
            One-time drops ·{" "}
            <a
              className="text-neon-blue"
              href={mintSolscanUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              {SHIT_MINT.slice(0, 4)}…{SHIT_MINT.slice(-4)}
            </a>
          </p>
        </div>
        <TreasuryBalanceBadge className="shrink-0" />
      </div>

      {/* Account strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {!authenticated ? (
          <button
            type="button"
            onClick={() => login()}
            className="min-h-9 px-3 rounded-md bg-neon text-black font-semibold active:scale-[0.98]"
          >
            Login / Sign up
          </button>
        ) : (
          <>
            {twitter ? (
              <span className="font-mono text-zinc-400 px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                @{twitter}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => linkTwitter()}
                className="min-h-9 px-3 rounded-md border border-sky-700 text-sky-400 font-medium"
              >
                Link X
              </button>
            )}
            {github ? (
              <span className="font-mono text-zinc-400 px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                gh/{github}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => linkGithub()}
                className="min-h-9 px-3 rounded-md border border-zinc-600 text-zinc-300 font-medium"
              >
                Link GitHub
              </button>
            )}
            {wallet ? (
              <span className="font-mono text-zinc-400 text-[10px] sm:text-xs truncate max-w-[40vw] sm:max-w-none px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                {wallet.slice(0, 4)}…{wallet.slice(-4)}
              </span>
            ) : authenticated ? (
              <span className="text-[11px] text-amber-400">Waiting for Solana wallet…</span>
            ) : null}
          </>
        )}
      </div>

      <div id="claim-status" className="space-y-2">
        {err && (
          <p className="text-sm text-red-400 break-words bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
            {err}
          </p>
        )}
        {msg && (
          <p className="text-sm text-green-400 break-words bg-green-950/30 border border-green-900/40 rounded-lg px-3 py-2">
            {msg}
          </p>
        )}
        {sig && (
          <a
            href={`https://solscan.io/tx/${sig}`}
            className="block text-xs text-neon-blue hover:underline font-mono break-all px-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            tx {sig.slice(0, 12)}…{sig.slice(-8)}
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <RewardRow
          highlight
          title={`Tweet + tag @${X_HANDLE}`}
          amount={CLAIM_X_TWEET}
          hint={
            <>
              Public tweet tagging{" "}
              <a
                href={X_URL}
                className="text-neon-blue"
                target="_blank"
                rel="noopener noreferrer"
              >
                @{X_HANDLE}
              </a>{" "}
              (last ~7 days).
            </>
          }
        >
          <div className="grid grid-cols-1 gap-2">
            <a
              href={tweetTagIntentUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BTN_OUTLINE} text-center`}
            >
              1. Post tweet
            </a>
            <input
              type="url"
              inputMode="url"
              placeholder="Paste tweet URL (required)"
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-zinc-600"
            />
            <div className="flex items-center justify-between gap-2">
              {claimedStatus["x_tweet"] ? (
            <span className="text-xs font-mono text-neon bg-neon/10 border border-neon/30 rounded-md px-2 py-1">Claimed ✓</span>
          ) : statusLoading ? (
            <span className="text-[10px] text-zinc-600">…</span>
          ) : null}
            </div>
            <button
              type="button"
              disabled={busy !== null || !!claimedStatus["x_tweet"] || !tweetUrl.trim()}
              onClick={() => claim("x_tweet")}
              className={BTN_NEON}
            >
              {busy === "x_tweet"
                ? "Checking…"
                : claimedStatus["x_tweet"]
                  ? "Already claimed"
                  : "2. Claim tweet"}
            </button>
          </div>
        </RewardRow>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RewardRow
            title={`Follow @${X_HANDLE}`}
            amount={CLAIM_X_FOLLOW}
            hint="Follow on X, then claim once."
          >
            <div className="grid grid-cols-1 gap-2">
              <a
                href={followIntentUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_OUTLINE} text-center`}
              >
                Follow
              </a>
              {claimedStatus["x_follow"] ? (
            <span className="text-xs font-mono text-neon bg-neon/10 border border-neon/30 rounded-md px-2 py-1">Claimed ✓</span>
          ) : statusLoading ? (
            <span className="text-[10px] text-zinc-600">…</span>
          ) : null}
              <button
                type="button"
                disabled={busy !== null || !!claimedStatus["x_follow"]}
                onClick={() => claim("x_follow")}
                className={BTN_SKY}
              >
                {busy === "x_follow"
                  ? "Checking…"
                  : claimedStatus["x_follow"]
                    ? "Already claimed"
                    : "Claim follow"}
              </button>
            </div>
          </RewardRow>

          <RewardRow
            title="X verified"
            amount={CLAIM_X_VERIFIED}
            hint="Blue / business / gov."
          >
            {claimedStatus["x_verified"] ? (
            <span className="text-xs font-mono text-neon bg-neon/10 border border-neon/30 rounded-md px-2 py-1">Claimed ✓</span>
          ) : statusLoading ? (
            <span className="text-[10px] text-zinc-600">…</span>
          ) : null}
            <button
              type="button"
              disabled={busy !== null || !!claimedStatus["x_verified"]}
              onClick={() => claim("x_verified")}
              className={BTN_SKY}
            >
              {busy === "x_verified"
                ? "Claiming…"
                : claimedStatus["x_verified"]
                  ? "Already claimed"
                  : authenticated
                    ? "Claim verified"
                    : "Login"}
            </button>
          </RewardRow>
        </div>

        <RewardRow
          title="GitHub fork"
          amount={CLAIM_GH_FORK}
          hint={
            <>
              Fork{" "}
              <a
                href="https://github.com/solana-foundation/tokens"
                className="text-neon-blue break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                solana-foundation/tokens
              </a>
            </>
          }
        >
          {claimedStatus["gh_fork"] ? (
            <span className="text-xs font-mono text-neon bg-neon/10 border border-neon/30 rounded-md px-2 py-1">Claimed ✓</span>
          ) : statusLoading ? (
            <span className="text-[10px] text-zinc-600">…</span>
          ) : null}
          <button
            type="button"
            disabled={busy !== null || !!claimedStatus["gh_fork"]}
            onClick={() => claim("gh_fork")}
            className={BTN_LIGHT}
          >
            {busy === "gh_fork"
              ? "Claiming…"
              : claimedStatus["gh_fork"]
                ? "Already claimed"
                : authenticated
                  ? "Claim GH fork"
                  : "Login"}
          </button>
        </RewardRow>
      </div>

      {treasuryShit != null && treasuryShit < CLAIM_X_TWEET && (
        <p className="text-xs text-amber-400 leading-snug">
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

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs pt-1">
        <a
          href={shitBuyUrl()}
          className="text-neon-blue hover:underline min-h-9 inline-flex items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy ${SHIT_SYMBOL} on Jupiter ↗
        </a>
        <a
          href={treasurySolscanUrl()}
          className="text-zinc-500 hover:text-zinc-300 min-h-9 inline-flex items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          Treasury on sol.new ↗
        </a>
      </div>
    </section>
  );
}
