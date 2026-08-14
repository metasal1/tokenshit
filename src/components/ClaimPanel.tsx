"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { isStandalonePwa } from "@/lib/pwa-auth";
import {
  CLAIM_EMAIL_LIST,
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_PREMIUM,
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

type ClaimKind =
  | "x_verified"
  | "x_premium"
  | "gh_fork"
  | "x_tweet"
  | "x_follow"
  | "email_list";

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
  const { ready, authenticated, user, getAccessToken, linkTwitter, linkGithub } =
    usePrivy();
  const { safeLogin, loginWithTwitter } = useSafeLogin();
  const { wallets } = useWallets();
  const [busy, setBusy] = useState<ClaimKind | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [treasuryShit, setTreasuryShit] = useState<number | null>(null);
  const [tweetUrl, setTweetUrl] = useState("");
  const [claimedStatus, setClaimedStatus] = useState<Record<string, boolean>>(
    {}
  );
  const [statusLoading, setStatusLoading] = useState(false);
  const [tweetCooldown, setTweetCooldown] = useState<{
    onCooldown: boolean;
    nextClaimAt: string | null;
    msRemaining: number;
  } | null>(null);
  /** claim progress steps for long X/treasury path */
  const [claimPhase, setClaimPhase] = useState<
    null | "session" | "verify" | "send" | "done"
  >(null);
  const [claimElapsed, setClaimElapsed] = useState(0);

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
      setTweetCooldown(null);
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
        if (d.tweet) {
          setTweetCooldown({
            onCooldown: !!d.tweet.onCooldown,
            nextClaimAt: d.tweet.nextClaimAt || null,
            msRemaining: Number(d.tweet.msRemaining || 0),
          });
        }
      })
      .catch(() => {})
      .finally(() => setStatusLoading(false));
  }, [authenticated, twitter, github, wallet, sig]);

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
    if (!wallet) {
      setErr("No Solana wallet yet — wait a second after login, or re-login.");
      return;
    }
    if (!twitter) {
      setErr("Sign in with X is required.");
      return;
    }
    if (kind === "gh_fork" && !github) {
      setMsg(null);
      setErr("Link GitHub first (Privy popup), then claim the fork.");
      linkGithub();
      return;
    }
    if (kind === "x_tweet" && !tweetUrl.trim()) {
      setErr("Paste your tweet URL first.");
      return;
    }

    setBusy(kind);
    setClaimPhase("session");
    const t0 = Date.now();
    const tick = window.setInterval(() => {
      setClaimElapsed(Math.floor((Date.now() - t0) / 1000));
    }, 250);

    try {
      const token = await getAccessToken();
      if (!token) {
        setErr("Session expired — log in again.");
        return;
      }
      setClaimPhase("verify");
      // advance to "send" after a short beat so UI always shows steps
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
          wallet,
          twitter,
          github,
          accessToken: token,
          ...(kind === "x_tweet" && tweetUrl.trim()
            ? { tweetUrl: tweetUrl.trim() }
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
        setErr((data.error || `Claim failed (${res.status})`) + detail);
        setClaimPhase(null);
        return;
      }
      setClaimPhase("done");
      setMsg(
        `Sent ${Number(data.amount).toLocaleString()} $${SHIT_SYMBOL} to wallet.`
      );
      setSig(data.signature || null);
      try {
        const handle = (twitter || github || "").replace(/^@/, "") || null;
        const kindLabel =
          kind === "x_verified"
            ? "X verified"
            : kind === "x_premium"
              ? "X premium"
              : kind === "gh_fork"
                ? "GH fork"
                : kind === "email_list"
                  ? "list join"
                  : kind === "x_tweet"
                    ? "tweet tag"
                    : "X follow";
        window.dispatchEvent(
          new CustomEvent("tokenshit:claim", {
            detail: {
              id: Date.now(),
              kind,
              kindLabel,
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
      requestAnimationFrame(() => {
        document
          .getElementById("claim-status")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      window.setTimeout(() => setClaimPhase(null), 1600);
    } catch (e) {
      setErr(String(e));
      setClaimPhase(null);
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

      <p className="text-[11px] sm:text-xs text-zinc-500 leading-snug rounded-lg border border-border/60 bg-zinc-950/40 px-3 py-2">
        <span className="text-zinc-300 font-medium">Rules:</span>{" "}
        X login required · PFP · 100+ followers · pay to Privy wallet linked to that X ·
        verified 10k / premium 20k / GH fork 100k · tweet every 24h · 1 major claim per IP per day
      </p>

      {/* Account strip */}
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
                onClick={() => { if (isStandalonePwa()) void loginWithTwitter(); else linkTwitter(); }}
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
              <span className="text-[11px] text-amber-400">Waiting for Solana wallet…</span>
            ) : null}
          </>
        )}
      </div>

      {/* Live claim progress — X checks + chain send can take 10–30s */}
      {claimPhase && (
        <div
          className="rounded-xl border border-neon/40 bg-zinc-950/90 p-3 sm:p-4 space-y-3 shadow-[0_0_30px_rgba(57,255,20,0.08)]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-white">
              {claimPhase === "done" ? "Claim complete" : "Claiming…"}
            </p>
            <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
              {claimElapsed}s
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-neon transition-all duration-500 ease-out"
              style={{
                width:
                  claimPhase === "session"
                    ? "18%"
                    : claimPhase === "verify"
                      ? "48%"
                      : claimPhase === "send"
                        ? "78%"
                        : "100%",
              }}
            />
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
            {(
              [
                ["session", "1 · Session"],
                ["verify", "2 · Verify"],
                ["send", "3 · Send"],
              ] as const
            ).map(([key, label]) => {
              const order = ["session", "verify", "send", "done"] as const;
              const cur = order.indexOf(claimPhase);
              const idx = order.indexOf(key);
              const done = cur > idx || claimPhase === "done";
              const active = claimPhase === key;
              return (
                <li
                  key={key}
                  className={`rounded-lg border px-2.5 py-2 ${
                    done
                      ? "border-neon/40 bg-neon/10 text-neon"
                      : active
                        ? "border-zinc-500 bg-zinc-900 text-white animate-pulse"
                        : "border-zinc-800 text-zinc-600"
                  }`}
                >
                  {label}
                  {active ? " …" : done ? " ✓" : ""}
                </li>
              );
            })}
          </ol>
          <p className="text-[11px] text-zinc-500 leading-snug">
            Checking X + treasury, then sending on Solana. Usually 5–25s —
            leave this tab open.
          </p>
        </div>
      )}

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
        {msg && (
          <div className="rounded-xl border border-neon/30 bg-neon/5 p-3 space-y-2">
            <p className="text-xs text-zinc-400">
              Flex the claim — share your ref so friends earn you 2k $
              {SHIT_SYMBOL}
            </p>
            <ShareRefButton path="/" variant="inline" handle={twitter || undefined} />
            {twitter && (
              <a
                href={tweetTagIntentUrl(
                  `Just claimed $${SHIT_SYMBOL} on @${X_HANDLE} — every token is shit until proven otherwise.\n\nhttps://tokenshit.com/?ref=${encodeURIComponent(twitter.toLowerCase())}`,
                  twitter
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_SKY} inline-flex items-center justify-center text-center no-underline`}
              >
                Tweet claim + ref
              </a>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <RewardRow
          highlight
          title={`Tweet + tag @${X_HANDLE}`}
          amount={CLAIM_X_TWEET}
          hint={
            <>
              Fresh tweet (under 24h) tagging{" "}
              <a
                href={X_URL}
                className="text-neon-blue"
                target="_blank"
                rel="noopener noreferrer"
              >
                @{X_HANDLE}
              </a>
              . Claim once every 24h.
            </>
          }
        >
          <div className="grid grid-cols-1 gap-2">
            {tweetCooldown?.onCooldown ? (
              <div className="rounded-lg border border-neon/30 bg-neon/10 px-3 py-3 space-y-1">
                <p className="text-sm font-semibold text-neon">
                  Tweet claim locked
                </p>
                <p className="text-xs text-zinc-400">
                  Already claimed in the last 24h — no need to search or paste
                  again.
                </p>
                {tweetCooldown.nextClaimAt && (
                  <p className="text-[11px] font-mono text-zinc-500">
                    Next claim after{" "}
                    {new Date(tweetCooldown.nextClaimAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <>
                <a
                  href={tweetTagIntentUrl(undefined, twitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BTN_OUTLINE} text-center`}
                >
                  1. Post tweet
                </a>
                <input
                  type="url"
                  inputMode="url"
                  placeholder="Paste tweet URL (required, under 24h old)"
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  disabled={
                    busy !== null ||
                    !!tweetCooldown?.onCooldown ||
                    !tweetUrl.trim()
                  }
                  onClick={() => claim("x_tweet")}
                  className={BTN_NEON}
                >
                  {busy === "x_tweet"
                    ? claimPhase === "send"
                    ? "Sending…"
                    : claimPhase === "verify"
                      ? "Verifying…"
                      : "Starting…"
                    : statusLoading
                      ? "…"
                      : "2. Claim tweet"}
                </button>
              </>
            )}
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
                  ? claimPhase === "send"
                    ? "Sending…"
                    : claimPhase === "verify"
                      ? "Verifying…"
                      : "Starting…"
                  : claimedStatus["x_follow"]
                    ? "Already claimed"
                    : "Claim follow"}
              </button>
            </div>
          </RewardRow>

          <RewardRow
            title="X Premium (blue)"
            amount={CLAIM_X_PREMIUM}
            hint="X Premium · 100+ followers · PFP · Privy wallet linked to X · 1 major/IP/day"
          >
            {claimedStatus["x_premium"] || claimedStatus["x_verified"] ? (
            <span className="text-xs font-mono text-neon bg-neon/10 border border-neon/30 rounded-md px-2 py-1">Claimed ✓</span>
          ) : statusLoading ? (
            <span className="text-[10px] text-zinc-600">…</span>
          ) : null}
            <button
              type="button"
              disabled={busy !== null || !!claimedStatus["x_premium"] || !!claimedStatus["x_verified"]}
              onClick={() => claim("x_premium")}
              className={BTN_SKY}
            >
              {busy === "x_premium"
                ? claimPhase === "send"
                ? "Sending…"
                : claimPhase === "verify"
                  ? "Verifying…"
                  : "Starting…"
                : claimedStatus["x_premium"] || claimedStatus["x_verified"]
                  ? "Already claimed"
                  : authenticated
                    ? "Claim premium 20k"
                    : "Login with X"}
            </button>
          </RewardRow>

          <RewardRow
            title="X verified"
            amount={CLAIM_X_VERIFIED}
            hint="Verified (not Premium) · 100+ followers · PFP · Privy wallet linked to X"
          >
            {claimedStatus["x_verified"] || claimedStatus["x_premium"] ? (
            <span className="text-xs font-mono text-neon bg-neon/10 border border-neon/30 rounded-md px-2 py-1">Claimed ✓</span>
          ) : statusLoading ? (
            <span className="text-[10px] text-zinc-600">…</span>
          ) : null}
            <button
              type="button"
              disabled={busy !== null || !!claimedStatus["x_verified"] || !!claimedStatus["x_premium"]}
              onClick={() => claim("x_verified")}
              className={BTN_SKY}
            >
              {busy === "x_verified"
                ? claimPhase === "send"
                ? "Sending…"
                : claimPhase === "verify"
                  ? "Verifying…"
                  : "Starting…"
                : claimedStatus["x_verified"] || claimedStatus["x_premium"]
                  ? "Already claimed"
                  : authenticated
                    ? "Claim verified 10k"
                    : "Login with X"}
            </button>
          </RewardRow>
        </div>

        <RewardRow
          title="Join the list"
          amount={CLAIM_EMAIL_LIST}
          hint="One-time 5,000 after email signup (same X / wallet). Join above, then claim."
        >
          {claimedStatus["email_list"] ? (
            <span className="text-xs font-mono text-neon bg-neon/10 border border-neon/30 rounded-md px-2 py-1">
              Claimed
            </span>
          ) : statusLoading ? (
            <span className="text-[10px] text-zinc-600">…</span>
          ) : null}
          <button
            type="button"
            disabled={busy !== null || !!claimedStatus["email_list"]}
            onClick={() => claim("email_list")}
            className={BTN_NEON}
          >
            {busy === "email_list"
              ? claimPhase === "send"
                ? "Sending…"
                : claimPhase === "verify"
                  ? "Verifying…"
                  : "Starting…"
              : claimedStatus["email_list"]
                ? "Already claimed"
                : authenticated
                  ? "Claim list 5k"
                  : "Login with X"}
          </button>
        </RewardRow>

        <RewardRow
                  title="GitHub fork"
                  amount={CLAIM_GH_FORK}
                  hint={
                    <>
                      100k · X required · 100+ followers · PFP · Link GitHub below · Fork{" "}
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
                    <span className="text-xs font-mono text-neon bg-neon/10 border border-neon/30 rounded-md px-2 py-1">
                      Claimed ✓
                    </span>
                  ) : statusLoading ? (
                    <span className="text-[10px] text-zinc-600">…</span>
                  ) : null}
                  {!authenticated ? (
                    <button type="button" onClick={() => safeLogin()} className={BTN_LIGHT}>
                      Login with X
                    </button>
                  ) : !github ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-amber-300/90 leading-snug">
                        X is linked. Tap below to attach GitHub to the same account (Privy
                        OAuth) — required for the fork claim.
                      </p>
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => {
                          setErr(null);
                          try {
                            linkGithub();
                          } catch (e) {
                            setErr(
                              e instanceof Error
                                ? e.message
                                : "Could not open GitHub link. Try avatar menu → Link GitHub."
                            );
                          }
                        }}
                        className={BTN_NEON}
                      >
                        Link GitHub account
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={busy !== null || !!claimedStatus["gh_fork"]}
                      onClick={() => claim("gh_fork")}
                      className={BTN_LIGHT}
                    >
                      {busy === "gh_fork"
                        ? claimPhase === "send"
                          ? "Sending…"
                          : claimPhase === "verify"
                            ? "Verifying…"
                            : "Starting…"
                        : claimedStatus["gh_fork"]
                          ? "Already claimed"
                          : `Claim fork as gh/${github}`}
                    </button>
                  )}
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
