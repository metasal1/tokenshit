"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets, useCreateWallet } from "@privy-io/react-auth/solana";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { isStandalonePwa } from "@/lib/pwa-auth";
import {
  CLAIM_EMAIL_LIST,
  CLAIM_GH_FORK,
  CLAIM_JUP_VERIFIED,
  CLAIM_X_FOLLOW,
  CLAIM_X_RETWEET,
  CLAIM_RT_TWEET_URL,
  CLAIM_X_PREMIUM,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  SHIT_MINT,
  SHIT_MINT_SOLANA_URI,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
  X_HANDLE,
  X_URL,
  followIntentUrl,
  retweetIntentUrl,
  quoteRetweetIntentUrl,
  treasurySolscanUrl,
  tweetTagIntentUrl,
  tweetClaimBody,
  LOVE_GAS_TWEET,
  PLAY_GAS_DROP_SOL,
  PLAY_GAS_STARTER_GAMES,
  loveGasTweetIntentUrl,
} from "@/lib/shit-token";
import { BalanceSkeleton } from "@/components/StatLoader";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { EmojiIcon } from "@/components/EmojiIcon";
import { XLogo } from "@/components/XLogo";

type ClaimKind =
  | "x_verified"
  | "x_premium"
  | "gh_fork"
  | "x_tweet"
  | "x_follow"
  | "x_retweet"
  | "email_list"
  | "jup_verified"
  | "sol_gas_love";

type ClaimPhase = null | "session" | "verify" | "send" | "done" | "error";

const BTN =
  "w-full min-h-11 touch-manipulation rounded-lg text-sm font-semibold py-3 px-3 transition disabled:opacity-50 active:scale-[0.98]";
const BTN_OUTLINE = `${BTN} border border-zinc-600 hover:border-neon text-white`;
const BTN_NEON = `${BTN} bg-neon text-black hover:brightness-110`;
const BTN_SKY = `${BTN} bg-sky-600 hover:bg-sky-500 text-white`;
const BTN_LIGHT = `${BTN} bg-zinc-100 hover:bg-white text-black`;
const BTN_CLAIMED = `${BTN} border border-neon/40 bg-neon/10 text-neon cursor-not-allowed`;

const KIND_TITLE: Record<ClaimKind, string> = {
  x_tweet: "X · Tweet tag",
  x_follow: "X · Follow",
  x_retweet: "X · Retweet promo",
  x_premium: "X Premium",
  x_verified: "X verified",
  email_list: "Email list",
  gh_fork: "GitHub fork",
  jup_verified: "Jupiter like",
  sol_gas_love: "Love gas (SOL)",
};

function fmt(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function phaseLabel(p: ClaimPhase): string {
  switch (p) {
    case "session":
      return "Checking session…";
    case "verify":
      return "Verifying eligibility…";
    case "send":
      return "Sending $TOKENSHIT…";
    case "done":
      return "Claim complete";
    case "error":
      return "Claim failed";
    default:
      return "";
  }
}

function phasePct(p: ClaimPhase): number {
  switch (p) {
    case "session":
      return 18;
    case "verify":
      return 48;
    case "send":
      return 78;
    case "done":
      return 100;
    case "error":
      return 100;
    default:
      return 0;
  }
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
        <span className="text-zinc-600 hidden sm:inline">· {sol.toFixed(3)} SOL</span>
      ) : null}
    </a>
  );
}

function RewardRow({
  title,
  amount,
  amountUnit,
  hint,
  children,
  highlight,
  claimed,
  statusLoading,
}: {
  title: string;
  amount: number;
  /** default $TOKENSHIT */
  amountUnit?: string;
  hint: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
  claimed?: boolean;
  statusLoading?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 sm:p-4 space-y-3 relative overflow-hidden ${
        claimed
          ? "border-neon/35 bg-neon/[0.06]"
          : highlight
            ? "border-neon/50 bg-neon/5"
            : "border-border bg-background/50"
      }`}
    >
      {claimed && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="inline-flex items-center gap-1 rounded-full border border-neon/50 bg-neon text-black text-[10px] font-orbitron uppercase tracking-wider font-bold px-2 py-1 shadow-[0_0_16px_rgba(57,255,20,0.35)]">
            <EmojiIcon size={12}>✅</EmojiIcon>
            Claimed
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 pr-16">
          <h3
            className={`font-semibold text-sm sm:text-base leading-snug ${
              claimed ? "text-zinc-300" : "text-white"
            }`}
          >
            {title}
          </h3>
          <div className="text-xs text-zinc-500 mt-1 leading-snug">{hint}</div>
        </div>
        <div className="shrink-0 text-right">
          <div
            className={`font-mono text-sm sm:text-base font-bold tabular-nums ${
              claimed ? "text-neon/70 line-through decoration-neon/40" : "text-neon"
            }`}
          >
            {amountUnit === "SOL"
              ? amount.toFixed(4)
              : amountUnit === "plays"
                ? amount.toLocaleString()
                : amount.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-600 font-mono">
            {amountUnit === "SOL"
              ? "SOL gas"
              : amountUnit === "plays"
                ? "plays gas"
                : `$${SHIT_SYMBOL}`}
          </div>
        </div>
      </div>
      {claimed ? (
        <div className="rounded-lg border border-neon/30 bg-zinc-950/70 px-3 py-3 space-y-1">
          <p className="text-sm font-semibold text-neon flex items-center gap-1.5">
            <EmojiIcon size={16}>✅</EmojiIcon>
            Already claimed
          </p>
          <p className="text-xs text-zinc-500">
            This reward is locked for your account. No need to try again.
          </p>
        </div>
      ) : statusLoading ? (
        <div className="text-[11px] text-zinc-600 font-mono animate-pulse">
          Checking claim status…
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/** Fixed bottom status while a claim is in flight — always on screen */
function ClaimStatusBar({
  kind,
  phase,
  elapsed,
  error,
  successMsg,
  signature,
  onDismiss,
}: {
  kind: ClaimKind | null;
  phase: ClaimPhase;
  elapsed: number;
  error: string | null;
  successMsg: string | null;
  signature: string | null;
  onDismiss: () => void;
}) {
  if (!phase && !error && !successMsg) return null;
  const pct = phasePct(phase);
  const isErr = phase === "error" || Boolean(error && phase !== "done");
  const isDone = phase === "done";

  return (
    <div
      className="fixed inset-x-0 z-[220] px-3 sm:px-4"
      style={{
        bottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
      role="status"
      aria-live="polite"
      aria-busy={phase === "session" || phase === "verify" || phase === "send"}
    >
      <div
        className={`mx-auto max-w-lg rounded-2xl border-2 backdrop-blur-xl shadow-2xl overflow-hidden ${
          isErr
            ? "border-red-500/50 bg-zinc-950/95 shadow-red-900/30"
            : isDone
              ? "border-neon/60 bg-zinc-950/95 shadow-[0_0_40px_rgba(57,255,20,0.25)]"
              : "border-neon/45 bg-zinc-950/95 shadow-[0_0_40px_rgba(57,255,20,0.2)]"
        }`}
      >
        <div className="px-4 pt-3.5 pb-2 flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            {isErr ? (
              <EmojiIcon size={22}>⚠️</EmojiIcon>
            ) : isDone ? (
              <EmojiIcon size={22}>✅</EmojiIcon>
            ) : (
              <EmojiIcon size={22} className="animate-spin" label="Loading">
                💫
              </EmojiIcon>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p
                className={`text-sm font-bold ${
                  isErr ? "text-red-300" : isDone ? "text-neon" : "text-white"
                }`}
              >
                {isErr
                  ? "Claim failed"
                  : isDone
                    ? "Claim complete"
                    : `Claiming ${kind ? KIND_TITLE[kind] : "…"}`}
              </p>
              <span className="text-[11px] font-mono text-zinc-500 tabular-nums shrink-0">
                {elapsed}s
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
              {isErr
                ? error || "Something went wrong"
                : isDone
                  ? successMsg || "Tokens sent to your wallet"
                  : phaseLabel(phase)}
            </p>
            {!isErr && !isDone && (
              <p className="text-[10px] text-zinc-600 mt-1">
                Leave this tab open · usually 5–25s
              </p>
            )}
            {isDone && signature && (
              <a
                href={`https://solscan.io/tx/${signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1.5 text-[11px] font-mono text-neon-blue hover:underline"
              >
                View tx ↗
              </a>
            )}
            {isDone && (
              <div className="mt-3 flex flex-col gap-2">
                <a
                  href="/play"
                  className="flex w-full min-h-11 items-center justify-center rounded-xl bg-neon text-black text-sm font-bold font-orbitron uppercase tracking-wide hover:brightness-110 active:scale-[0.99]"
                >
                  Play this hour →
                </a>
                <p className="text-[10px] text-zinc-500 text-center leading-snug">
                  1,000 $TOKENSHIT · pick HIT or SHIT · winners split the pot
                </p>
              </div>
            )}
            {isErr && error && (
              <p className="mt-1.5 text-[11px] text-red-400/90 break-words leading-snug">
                {error}
              </p>
            )}
          </div>
          {(isDone || isErr) && (
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 rounded-lg border border-zinc-600 px-2.5 py-1.5 text-[10px] font-orbitron uppercase tracking-wider text-zinc-400 hover:text-white hover:border-zinc-400"
            >
              Close
            </button>
          )}
        </div>

        {/* steps */}
        {!isErr && (
          <div className="px-4 pb-2">
            <ol className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              {(
                [
                  ["session", "Session"],
                  ["verify", "Verify"],
                  ["send", "Send"],
                ] as const
              ).map(([key, label]) => {
                const order = ["session", "verify", "send", "done"] as const;
                const cur = phase ? order.indexOf(phase as (typeof order)[number]) : -1;
                const idx = order.indexOf(key);
                const done = cur > idx || phase === "done";
                const active = phase === key;
                return (
                  <li
                    key={key}
                    className={`rounded-md border px-1.5 py-1.5 text-center ${
                      done
                        ? "border-neon/40 bg-neon/10 text-neon"
                        : active
                          ? "border-zinc-500 bg-zinc-900 text-white"
                          : "border-zinc-800 text-zinc-600"
                    }`}
                  >
                    {done ? "✓ " : active ? "… " : ""}
                    {label}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="h-1.5 w-full bg-zinc-900">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isErr ? "bg-red-500" : "bg-neon"
            }`}
            style={{ width: `${isErr ? 100 : pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ClaimPanel() {
  const { ready, authenticated, user, getAccessToken, linkTwitter, linkGithub } =
    usePrivy();
  const { safeLogin, loginWithTwitter } = useSafeLogin();
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const [walletCreating, setWalletCreating] = useState(false);
  const [walletCreateTried, setWalletCreateTried] = useState(false);
  const [busy, setBusy] = useState<ClaimKind | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [treasuryShit, setTreasuryShit] = useState<number | null>(null);
  const [tweetUrl, setTweetUrl] = useState("");
  const [rtTweetUrl, setRtTweetUrl] = useState("");
  const [loveTweetUrl, setLoveTweetUrl] = useState("");
  const [following, setFollowing] = useState<boolean | null>(null);
  const [claimedStatus, setClaimedStatus] = useState<Record<string, boolean>>(
    {}
  );
  const [statusLoading, setStatusLoading] = useState(false);
  const [tweetData, setTweetData] = useState<{
    onCooldown: boolean;
    nextClaimAt: string | null;
    msRemaining: number;
  } | null>(null);
  const [claimPhase, setClaimPhase] = useState<ClaimPhase>(null);
  const [claimElapsed, setClaimElapsed] = useState(0);
  const [activeKind, setActiveKind] = useState<ClaimKind | null>(null);

  const twitter = user?.twitter?.username || null;
  const github = user?.github?.username || null;
  const wallet = useMemo(
    () => pickSolanaAddress(wallets, user),
    [wallets, user]
  );

  /** Privy sometimes skips auto Solana wallet (esp. after X+GitHub link) — create explicitly */
  const ensureSolanaWallet = useCallback(async () => {
    if (!authenticated || !ready) return null;
    if (pickSolanaAddress(wallets, user)) return pickSolanaAddress(wallets, user);
    setWalletCreating(true);
    setErr(null);
    try {
      const res = await createWallet();
      const addr =
        (res as { wallet?: { address?: string } })?.wallet?.address ||
        (res as { address?: string })?.address ||
        null;
      if (addr) {
        setMsg("Solana wallet ready — you can claim now.");
        return addr;
      }
      // wallets list may refresh async
      await new Promise((r) => setTimeout(r, 800));
      return pickSolanaAddress(wallets, user);
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      if (!/already|exists/i.test(m)) {
        setErr(
          m.slice(0, 160) ||
            "Could not create wallet — try Log out and log in with X again."
        );
      }
      return null;
    } finally {
      setWalletCreating(false);
      setWalletCreateTried(true);
    }
  }, [authenticated, ready, wallets, user, createWallet]);

  useEffect(() => {
    if (!ready || !authenticated || wallet || walletCreateTried || walletCreating) return;
    void ensureSolanaWallet();
  }, [
    ready,
    authenticated,
    wallet,
    walletCreateTried,
    walletCreating,
    ensureSolanaWallet,
  ]);

  const isClaimed = (kind: ClaimKind) => {
    if (kind === "x_tweet") return !!tweetData?.onCooldown;
    if (kind === "x_premium")
      return !!claimedStatus.x_premium || !!claimedStatus.x_verified;
    if (kind === "x_verified")
      return !!claimedStatus.x_verified || !!claimedStatus.x_premium;
    return !!claimedStatus[kind];
  };

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
      setTweetData(null);
      setFollowing(null);
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
        if (typeof d.following === "boolean") setFollowing(d.following);
        else if (d.following === null) setFollowing(null);
        if (typeof d.treasuryShit === "number") setTreasuryShit(d.treasuryShit);
        if (d.tweet) {
          setTweetData({
            onCooldown: !!d.tweet.onCooldown,
            nextClaimAt: d.tweet.nextClaimAt || null,
            msRemaining: Number(d.tweet.msRemaining || 0),
          });
        }
      })
      .catch(() => {})
      .finally(() => setStatusLoading(false));
  }, [authenticated, twitter, github, wallet, sig]);

  function dismissStatus() {
    setClaimPhase(null);
    setClaimElapsed(0);
    setActiveKind(null);
    if (claimPhase === "error") setErr(null);
  }

  const canOtherClaims = !authenticated || following !== false;

  async function claim(kind: ClaimKind) {
    setErr(null);
    setMsg(null);
    setSig(null);
    setClaimPhase(null);
    setClaimElapsed(0);

    if (!authenticated) {
      safeLogin();
      return;
    }
    if (kind !== "x_follow" && following === false) {
      setErr(
        `Follow @${X_HANDLE} on X first — required before any other claim.`
      );
      setClaimPhase("error");
      return;
    }
    let payWallet = wallet;
    if (!payWallet) {
      payWallet = await ensureSolanaWallet();
      if (!payWallet) {
        setErr(
          "No Solana wallet yet — tap Create Solana wallet, or log out and log in with X again."
        );
        setClaimPhase("error");
        return;
      }
    }
    if (!twitter) {
      setErr("Sign in with X is required.");
      setClaimPhase("error");
      return;
    }

    // Hard block already-claimed — never hit the API again
    if (isClaimed(kind)) {
      setErr(
        kind === "x_tweet"
          ? "Tweet claim is on cooldown — already claimed in the last 24h."
          : "Already claimed — this reward is locked for your account."
      );
      setClaimPhase("error");
      return;
    }

    if (kind === "gh_fork") {
      setErr("GitHub fork claim is disabled.");
      setClaimPhase("error");
      return;
    }
    if (kind === "sol_gas_love" && !loveTweetUrl.trim()) {
      setErr(`Tweet exactly: ${LOVE_GAS_TWEET} — paste the link.`);
      return;
    }
    if (kind === "x_tweet" && !tweetUrl.trim()) {
      setErr("Paste your tweet URL first.");
      setClaimPhase("error");
      return;
    }

    setBusy(kind);
    setActiveKind(kind);
    setClaimPhase("session");
    const t0 = Date.now();
    const tick = window.setInterval(() => {
      setClaimElapsed(Math.floor((Date.now() - t0) / 1000));
    }, 250);

    try {
      const token = await getAccessToken();
      if (!token) {
        setErr("Session expired — log in again.");
        setClaimPhase("error");
        return;
      }
      setClaimPhase("verify");
      const sendTimer = window.setTimeout(() => setClaimPhase("send"), 900);

      const res = await fetch("/api/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-privy-token": token,
        },
        body: JSON.stringify({
          kind,
          wallet: payWallet,
          twitter,
          github,
          accessToken: token,
          ...(kind === "x_tweet" && tweetUrl.trim()
            ? { tweetUrl: tweetUrl.trim() }
            : {}),
          ...(kind === "x_retweet" && rtTweetUrl.trim()
            ? { tweetUrl: rtTweetUrl.trim() }
            : {}),
          ...(kind === "sol_gas_love" && loveTweetUrl.trim()
            ? { tweetUrl: loveTweetUrl.trim() }
            : {}),
          ...(kind === "email_list" && user?.email?.address
            ? { email: user.email.address }
            : {}),
        }),
      });
      window.clearTimeout(sendTimer);
      setClaimPhase("send");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail =
          typeof data.detail === "string"
            ? ` (${data.detail})`
            : data.meta?.errors
              ? ` (${JSON.stringify(data.meta.errors).slice(0, 120)})`
              : "";
        const msgText = (data.error || `Claim failed (${res.status})`) + detail;
        // Friendlier copy for RPC blips (server already maps 429 → this text)
        const friendly = /RPC HTTP 429|rpc_rate_limit|RPC busy/i.test(msgText)
          ? "Solana is rate-limiting us — wait ~5s and tap Claim again."
          : msgText;
        setErr(friendly);
        setClaimPhase("error");
        // Premium clicked but user is non-premium verified → auto-route verified
        if (
          kind === "x_premium" &&
          (/non-premium verified|verified tier instead|use_premium/i.test(
            String(data.error || "") + String(data.code || "")
          ) ||
            data.code === "not_premium")
        ) {
          setMsg("Not X Premium — trying Verified tier instead…");
          window.setTimeout(() => {
            void claim("x_verified");
          }, 400);
          return;
        }
        // Verified clicked but user is Premium → auto-route premium
        if (
          kind === "x_verified" &&
          (data.code === "use_premium_tier" ||
            /use the Premium claim|premium tier/i.test(String(data.error || "")))
        ) {
          setMsg("You have X Premium — claiming Premium tier…");
          window.setTimeout(() => {
            void claim("x_premium");
          }, 400);
          return;
        }
        // Server says already claimed — lock the row
        if (
          res.status === 409 ||
          /already claimed|already paid|cooldown/i.test(String(data.error || ""))
        ) {
          setClaimedStatus((s) => ({ ...s, [kind]: true }));
          if (kind === "x_follow") setFollowing(true);
          if (kind === "x_tweet") {
            setTweetData((t) => ({
              onCooldown: true,
              nextClaimAt: t?.nextClaimAt || null,
              msRemaining: t?.msRemaining || 0,
            }));
          }
        }
        return;
      }
      setClaimPhase("done");
      {
        const gas = data.gasDrop as
          | { ok?: boolean; sol?: number; games?: number }
          | undefined;
        if (kind === "sol_gas_love" || data.unit === "SOL") {
          setMsg(
            `Claimed gas for ${
              gas?.games || PLAY_GAS_STARTER_GAMES
            } plays (${Number(data.amount || gas?.sol || PLAY_GAS_DROP_SOL).toFixed(4)} SOL). Go play this hour.`
          );
        } else {
          const gasBit =
            gas?.ok && gas.sol
              ? ` + ${Number(gas.sol).toFixed(4)} SOL gas (~${gas.games || 67} plays)`
              : "";
          setMsg(
            `Sent ${Number(data.amount).toLocaleString()} $${SHIT_SYMBOL} to wallet.${gasBit} Play this hour with it.`
          );
        }
      }
      setSig(data.signature || null);
      // Lock UI immediately
      setClaimedStatus((s) => ({ ...s, [kind]: true }));
      if (kind === "x_follow") setFollowing(true);
      if (kind === "x_tweet") {
        setTweetData({
          onCooldown: true,
          nextClaimAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
          msRemaining: 24 * 3600_000,
        });
      }
      if (kind === "x_premium" || kind === "x_verified") {
        setClaimedStatus((s) => ({
          ...s,
          x_premium: kind === "x_premium" ? true : s.x_premium,
          x_verified: true,
        }));
      }
      try {
        const handle = (twitter || github || "").replace(/^@/, "") || null;
        window.dispatchEvent(
          new CustomEvent("tokenshit:claim", {
            detail: {
              id: Date.now(),
              kind,
              kindLabel: KIND_TITLE[kind],
              handle,
              twitter: twitter || null,
              github: github || null,
              amount: Number(data.amount) || 0,
              avatarUrl: twitter
                ? `https://unavatar.io/twitter/${encodeURIComponent(twitter)}`
                : null,
              createdAt: new Date().toISOString(),
              signature: data.signature || null,
              self: true,
            },
          })
        );
      } catch {
        /* ignore */
      }
    } catch (e) {
      setErr(String(e));
      setClaimPhase("error");
    } finally {
      window.clearInterval(tick);
      setBusy(null);
    }
  }

  if (!ready) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 animate-pulse h-40" />
    );
  }

  const showBar = Boolean(claimPhase);

  return (
    <section
      className={`rounded-xl border border-border bg-card p-3.5 sm:p-5 space-y-3 sm:space-y-4 ${
        showBar ? "pb-36 sm:pb-40" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 sticky top-0 z-10 -mx-3.5 sm:mx-0 px-3.5 sm:px-0 py-2 sm:py-0 bg-card/95 sm:bg-transparent backdrop-blur sm:backdrop-blur-none border-b border-border/50 sm:border-0">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground truncate">
            Your claims
          </h2>
          <p className="text-[11px] text-zinc-500">Login · <b className="text-neon">follow first</b> · then claim</p>
        </div>
        <TreasuryBalanceBadge className="shrink-0" />
      </div>

      <p className="text-[11px] text-zinc-500 leading-snug">
        <span className="text-neon font-semibold">X required</span>
        {" "}· PFP · 250+ followers · tweet every 24h
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {!authenticated ? (
          <button
            type="button"
            onClick={() => safeLogin()}
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
                onClick={() => {
                  if (isStandalonePwa()) void loginWithTwitter();
                  else linkTwitter();
                }}
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
                className="min-h-9 px-3 rounded-md border border-neon/50 bg-neon/10 text-neon font-semibold"
              >
                + Link GitHub
              </button>
            )}
            {wallet ? (
              <span className="font-mono text-zinc-400 text-[10px] sm:text-xs truncate max-w-[40vw] sm:max-w-none px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                {wallet.slice(0, 4)}…{wallet.slice(-4)}
              </span>
            ) : authenticated ? (
              <button
                type="button"
                disabled={walletCreating}
                onClick={() => void ensureSolanaWallet()}
                className="min-h-9 px-3 rounded-md border border-amber-400/50 bg-amber-500/15 text-amber-200 text-[11px] font-semibold disabled:opacity-50"
              >
                {walletCreating ? "Creating wallet…" : "Create Solana wallet"}
              </button>
            ) : null}
          </>
        )}
      </div>

      {/* Inline success only when bar dismissed */}
      {!showBar && (
        <div id="claim-status" className="space-y-2">
          {err && (
            <p className="text-sm text-red-400 break-words bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
              {err}
            </p>
          )}
          {msg && (
            <div className="space-y-2 rounded-lg border border-green-900/40 bg-green-950/30 px-3 py-2">
              <p className="text-sm text-green-400 break-words">{msg}</p>
              <a
                href="/play"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-neon text-black text-xs font-bold font-orbitron uppercase tracking-wide hover:brightness-110"
              >
                Play with it →
              </a>
            </div>
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
      )}


      <div className="grid grid-cols-1 gap-3">

        <RewardRow
          claimed={!!claimedStatus.x_follow}
          statusLoading={statusLoading && authenticated}
          title={`Follow @${X_HANDLE}`}
          amount={CLAIM_X_FOLLOW}
          hint="Required first — unlocks every other claim. Follow, then claim once."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={followIntentUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BTN_OUTLINE} text-center`}
            >
              <span className="inline-flex items-center justify-center gap-1.5"><XLogo size={14} /> Follow</span>
            </a>
            <button
              type="button"
              disabled={busy !== null || !!claimedStatus.x_follow}
              onClick={() => claim("x_follow")}
              className={BTN_SKY}
            >
              {busy === "x_follow" ? "Claiming…" : "Claim follow"}
            </button>
          </div>
        </RewardRow>

        {authenticated && following === false && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-100 leading-snug">
            <b className="text-amber-300">Follow @{X_HANDLE} first.</b>{" "}
            RT / tweet / other claims stay locked until you follow.
          </div>
        )}
        {authenticated && following === true && (
          <div className="rounded-lg border border-neon/25 bg-neon/5 px-3 py-1.5 text-[11px] text-neon/90">
            Following @{X_HANDLE} · claims unlocked
          </div>
        )}

        <RewardRow
          highlight
          claimed={!!tweetData?.onCooldown}
          statusLoading={statusLoading && authenticated}
          title={`Tweet + tag @${X_HANDLE}`}
          amount={CLAIM_X_TWEET}
          hint={
            <>
              Tweet <b>must</b> include <span className="font-mono text-neon">@Tokenshit_</span> <b>AND</b> the line<br/>
              <span className="font-mono text-xs break-all">solana:fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit</span>
              {tweetData?.onCooldown && tweetData.nextClaimAt ? (
                <span className="block mt-1 font-mono text-zinc-500">
                  Next after {new Date(tweetData.nextClaimAt).toLocaleString()}
                </span>
              ) : null}
            </>
          }
        >
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  const body = tweetClaimBody(twitter || undefined);
                  void navigator.clipboard.writeText(body);
                }}
                className="underline text-neon hover:text-white"
              >
                Copy tweet text
              </button>
              <span className="text-zinc-600 font-mono truncate max-w-[min(100%,14rem)]">{SHIT_MINT_SOLANA_URI}</span>
            </div>

            <a
              href={tweetTagIntentUrl(undefined, twitter)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BTN_OUTLINE} text-center font-semibold`}
            >
              <span className="inline-flex items-center justify-center gap-1.5"><XLogo size={14} /> 1. Tweet + CA</span>
            </a>

            <input
              type="url"
              inputMode="url"
              placeholder="Paste your tweet URL (must be &lt;24h old)"
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-zinc-600"
            />
            <button
              type="button"
              disabled={busy !== null || !canOtherClaims || !!tweetData?.onCooldown || !tweetUrl.trim()}
              onClick={() => claim("x_tweet")}
              className={BTN_NEON}
            >
              {busy === "x_tweet"
                ? phaseLabel(claimPhase).replace("…", "") || "Claiming"
                : "2. Claim (needs CA in tweet)"}
            </button>
          </div>
        </RewardRow>

        <RewardRow
          claimed={!!claimedStatus.x_retweet}
          statusLoading={statusLoading && authenticated}
          title="Retweet promo"
          amount={CLAIM_X_RETWEET}
          hint={
            <>
              RT or quote{" "}
              <a
                href={CLAIM_RT_TWEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon underline"
              >
                this post
              </a>
              , then claim once (1,000).
            </>
          }
        >
          <div className="grid grid-cols-1 gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={retweetIntentUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_OUTLINE} text-center`}
              >
                <span className="inline-flex items-center justify-center gap-1.5"><XLogo size={14} /> 1. Retweet</span>
              </a>
              <a
                href={quoteRetweetIntentUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_OUTLINE} text-center`}
              >
                <span className="inline-flex items-center justify-center gap-1.5"><XLogo size={14} /> Or quote RT</span>
              </a>
            </div>
            <input
              type="url"
              inputMode="url"
              placeholder="Optional: paste your quote-tweet URL if claim fails"
              value={rtTweetUrl}
              onChange={(e) => setRtTweetUrl(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-zinc-600"
            />
            <button
              type="button"
              disabled={busy !== null || !canOtherClaims || !!claimedStatus.x_retweet}
              onClick={() => claim("x_retweet")}
              className={BTN_SKY}
            >
              {busy === "x_retweet" ? "Claiming…" : "2. Claim 1,000 $TOKENSHIT"}
            </button>
          </div>
        </RewardRow>

        <details className="rounded-xl border border-border/70 bg-zinc-950/30 group">
          <summary className="cursor-pointer list-none px-3.5 py-3 text-sm font-semibold text-zinc-300 flex items-center justify-between gap-2">
            <span>More rewards</span>
            <span className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-500 group-open:text-neon">
              Show
            </span>
          </summary>
          <div className="px-2 pb-3 space-y-3">
            <RewardRow
              claimed={!!claimedStatus.sol_gas_love}
              statusLoading={statusLoading && authenticated}
              title="Love gas (SOL starter)"
              amount={PLAY_GAS_STARTER_GAMES}
              amountUnit="plays"
              hint={
                <>
                  First claim · tweet exact{" "}
                  <span className="font-mono text-[10px] text-neon">{LOVE_GAS_TWEET}</span>
                </>
              }
            >
              <div className="grid grid-cols-1 gap-2">
                <a
                  href={loveGasTweetIntentUrl(twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BTN_OUTLINE} text-center`}
                >
                  1. Post love tweet
                </a>
                <input
                  type="url"
                  inputMode="url"
                  placeholder="Paste tweet URL"
                  value={loveTweetUrl}
                  onChange={(e) => setLoveTweetUrl(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  disabled={
                    busy !== null ||
                    !canOtherClaims ||
                    !!claimedStatus.sol_gas_love ||
                    !loveTweetUrl.trim()
                  }
                  onClick={() => claim("sol_gas_love")}
                  className={BTN_NEON}
                >
                  {busy === "sol_gas_love"
                    ? phaseLabel(claimPhase)
                    : `Claim ${PLAY_GAS_STARTER_GAMES} plays`}
                </button>
              </div>
            </RewardRow>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RewardRow
                claimed={!!claimedStatus.x_premium || !!claimedStatus.x_verified}
                statusLoading={statusLoading && authenticated}
                title="X Premium"
                amount={CLAIM_X_PREMIUM}
                hint="Blue check · exclusive vs verified"
              >
                <button
                  type="button"
                  disabled={
                    busy !== null ||
                    !canOtherClaims ||
                    !!claimedStatus.x_premium ||
                    !!claimedStatus.x_verified
                  }
                  onClick={() => claim("x_premium")}
                  className={BTN_SKY}
                >
                  {busy === "x_premium"
                    ? "Claiming…"
                    : authenticated
                      ? `Claim ${CLAIM_X_PREMIUM.toLocaleString()}`
                      : "Login with X"}
                </button>
              </RewardRow>

              <RewardRow
                claimed={!!claimedStatus.x_verified || !!claimedStatus.x_premium}
                statusLoading={statusLoading && authenticated}
                title="X verified"
                amount={CLAIM_X_VERIFIED}
                hint="Non-premium verified only"
              >
                <button
                  type="button"
                  disabled={
                    busy !== null ||
                    !canOtherClaims ||
                    !!claimedStatus.x_verified ||
                    !!claimedStatus.x_premium
                  }
                  onClick={() => claim("x_verified")}
                  className={BTN_SKY}
                >
                  {busy === "x_verified"
                    ? "Claiming…"
                    : authenticated
                      ? `Claim ${CLAIM_X_VERIFIED.toLocaleString()}`
                      : "Login with X"}
                </button>
              </RewardRow>
            </div>

            <RewardRow
              claimed={!!claimedStatus.jup_verified}
              statusLoading={statusLoading && authenticated}
              title="Like on Jupiter"
              amount={CLAIM_JUP_VERIFIED}
              hint={
                <>
                  Like $TOKENSHIT on{" "}
                  <a
                    href={`https://verified.jup.ag/dashboard/${SHIT_MINT}`}
                    className="text-neon-blue"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Jupiter VRFD
                  </a>{" "}
                  with the same X
                </>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={`https://verified.jup.ag/dashboard/${SHIT_MINT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={BTN_OUTLINE + " inline-flex items-center justify-center"}
                >
                  Open Jupiter
                </a>
                <button
                  type="button"
                  disabled={busy !== null || !canOtherClaims || !!claimedStatus.jup_verified}
                  onClick={() => claim("jup_verified")}
                  className={BTN_NEON}
                >
                  {busy === "jup_verified"
                    ? "Checking…"
                    : authenticated
                      ? `Claim ${CLAIM_JUP_VERIFIED.toLocaleString()}`
                      : "Login"}
                </button>
              </div>
            </RewardRow>

            <RewardRow
              claimed={!!claimedStatus.email_list}
              statusLoading={statusLoading && authenticated}
              title="Join the list"
              amount={CLAIM_EMAIL_LIST}
              hint="One-time email list claim"
            >
              <button
                type="button"
                disabled={busy !== null || !canOtherClaims || !!claimedStatus.email_list}
                onClick={() => claim("email_list")}
                className={BTN_NEON}
              >
                {busy === "email_list"
                  ? "Claiming…"
                  : authenticated
                    ? `Claim ${CLAIM_EMAIL_LIST.toLocaleString()}`
                    : "Login with X"}
              </button>
            </RewardRow>
          </div>
        </details>

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

      <p className="text-[11px] text-zinc-600 pt-1">
        <a href="/play" className="text-neon font-semibold hover:underline">
          Play $HIT OF THE DAY
        </a>
        {" · "}
        <a href="/kols" className="text-zinc-400 hover:text-neon">
          Scout KOLs 2.5K
        </a>
        {" · "}
        <a href="/swap" className="text-zinc-400 hover:text-neon">
          Buy
        </a>
      </p>

      {/* Always-on-screen claim status */}
      <ClaimStatusBar
        kind={activeKind}
        phase={claimPhase}
        elapsed={claimElapsed}
        error={err}
        successMsg={msg}
        signature={sig}
        onDismiss={dismissStatus}
      />
    </section>
  );
}
