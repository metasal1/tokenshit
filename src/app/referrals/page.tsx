"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import Link from "next/link";
import { REFERRAL_REWARD_SHIT, SHIT_SYMBOL } from "@/lib/shit-token";
import ShareRefButton from "@/components/ShareRefButton";
import ShitBalanceBadge from "@/components/ShitBalanceBadge";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { EmojiIcon } from "@/components/EmojiIcon";
import { BalanceSkeleton } from "@/components/StatLoader";

interface LeaderboardEntry {
  username: string;
  referralCount: number;
}

interface UserStats {
  totalReferrals: number;
  username: string;
  paidCount?: number;
  unpaidCount?: number;
  paidAmount?: number;
  referrals: Array<{
    referred_twitter: string;
    created_at: string;
    paid?: boolean;
    amount?: number | null;
    signature?: string | null;
  }>;
}

function StatTile({
  label,
  children,
  accent = "default",
}: {
  label: string;
  children: React.ReactNode;
  accent?: "default" | "neon" | "amber";
}) {
  const ring =
    accent === "neon"
      ? "border-neon/35 bg-neon/5"
      : accent === "amber"
        ? "border-amber-500/30 bg-amber-950/20"
        : "border-border bg-zinc-950/60";
  return (
    <div className={`rounded-2xl border ${ring} p-4 sm:p-5 min-h-[6.5rem] flex flex-col gap-2`}>
      <span className="text-[10px] font-orbitron uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

export default function ReferralsPage() {
  const { authenticated, user, login, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const [claimErr, setClaimErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/referral/leaderboard")
      .then((r) => r.json())
      .then((d) => setLeaderboard(d.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    const handle = user?.twitter?.username?.toLowerCase();
    if (authenticated && handle) {
      fetch(`/api/referral/stats?username=${encodeURIComponent(handle)}`)
        .then((r) => r.json())
        .then((d) => setUserStats(d))
        .catch(() => {});
    }
  }, [authenticated, user]);

  const twitterHandle = user?.twitter?.username?.toLowerCase();
  const wallet = useMemo(
    () => pickSolanaAddress(wallets, user),
    [wallets, user]
  );
  const referralLink = twitterHandle
    ? `https://tokenshit.com/?ref=${twitterHandle}`
    : null;

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  async function claimRewards() {
    setClaimErr(null);
    setClaimMsg(null);
    if (!authenticated) {
      login();
      return;
    }
    if (!twitterHandle || !wallet) {
      setClaimErr("Need X login + Solana wallet");
      return;
    }
    setClaimBusy(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45_000);
    try {
      const token = await getAccessToken();
      if (!token) {
        setClaimErr("Session missing — log out and log back in");
        return;
      }
      const res = await fetch("/api/referral/claim-rewards", {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-privy-token": token,
        },
        body: JSON.stringify({
          twitter: twitterHandle,
          wallet,
          accessToken: token,
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
        setClaimErr((data.error || `Claim failed (${res.status})`) + detail);
        return;
      }
      if (data.errors?.length) {
        setClaimErr(data.errors.join("; "));
      }
      setClaimMsg(
        data.paid
          ? `Paid ${Number(data.amount).toLocaleString()} $${SHIT_SYMBOL} for ${data.paid} referral(s)`
          : data.message ||
              (data.errors?.length
                ? "No payouts this run — see errors"
                : "Nothing to claim")
      );
      if (twitterHandle) {
        fetch(
          `/api/referral/stats?username=${encodeURIComponent(twitterHandle)}`
        )
          .then((r) => r.json())
          .then((d) => setUserStats(d))
          .catch(() => {});
      }
    } catch (e) {
      const msg =
        e instanceof Error && e.name === "AbortError"
          ? "Payout timed out (45s). Refresh and try again — check wallet + treasury RPC."
          : String(e);
      setClaimErr(msg);
    } finally {
      clearTimeout(timer);
      setClaimBusy(false);
    }
  }

  const unpaidAmt =
    (userStats?.unpaidCount ?? 0) * REFERRAL_REWARD_SHIT;

  return (
    <div className="flex flex-col pb-10 md:pb-14 lg:pb-16">
      {/* Hero */}
      <header className="relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neon/[0.09] via-neon/[0.03] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />

        <div className="relative mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-6xl px-4 sm:px-5 md:px-6 lg:px-8 pt-5 sm:pt-6 md:pt-8 lg:pt-10 pb-5 sm:pb-6 md:pb-7">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
            <div className="text-center md:text-left min-w-0">
              <p className="text-[10px] font-orbitron uppercase tracking-[0.22em] text-neon mb-1.5">
                Earn ${SHIT_SYMBOL}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-monoton leading-none text-white">
                Spread the{" "}
                <span className="neon-text">Shit</span>
              </h1>
              <p className="mt-2 text-sm md:text-[15px] text-zinc-400 max-w-md mx-auto md:mx-0 leading-relaxed">
                Refer degens → earn{" "}
                <span className="text-neon font-mono font-semibold">
                  {REFERRAL_REWARD_SHIT.toLocaleString()} ${SHIT_SYMBOL}
                </span>{" "}
                each when they join with your link.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
              <ShitBalanceBadge className="!min-h-10" />
              <nav
                className="flex flex-wrap justify-center md:justify-end gap-2"
                aria-label="Referral shortcuts"
              >
                {(
                  [
                    { href: "/claim", label: "Claim", emoji: "🎁" },
                    { href: "/play", label: "Play", emoji: "🎯" },
                    { href: "/boards", label: "Boards", emoji: "📊" },
                  ] as const
                ).map((q) => (
                  <Link
                    key={q.href}
                    href={q.href}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/80 hover:border-neon/40 hover:bg-card px-3 py-2 text-[11px] font-orbitron uppercase tracking-wider text-zinc-300 transition-colors"
                  >
                    <EmojiIcon size={14}>{q.emoji}</EmojiIcon>
                    {q.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-6xl px-4 sm:px-5 md:px-6 lg:px-8 space-y-5 md:space-y-6 pt-5 sm:pt-6 md:pt-8">
        {/* Logged-out CTA */}
        {!authenticated && (
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center space-y-4">
            <EmojiIcon size={36}>🔗</EmojiIcon>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Login with X to get your referral link and claim rewards.
            </p>
            <button
              type="button"
              onClick={() => login()}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neon px-8 text-sm font-bold font-orbitron uppercase tracking-wide text-black hover:brightness-110 transition"
            >
              Login with X
            </button>
          </section>
        )}

        {/* Your stats */}
        {authenticated && twitterHandle && (
          <section className="rounded-2xl border border-neon/30 bg-gradient-to-b from-neon/10 via-card to-card overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <EmojiIcon size={18}>👤</EmojiIcon>
                <h2 className="text-sm font-bold font-orbitron uppercase tracking-wide text-white">
                  Your referrals
                </h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                @{twitterHandle}
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatTile label={`Wallet $${SHIT_SYMBOL}`}>
                  <ShitBalanceBadge className="!min-h-10 !px-3 !text-sm !border-neon/40" />
                </StatTile>
                <StatTile label="Total referrals">
                  <p className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                    {userStats?.totalReferrals ?? 0}
                  </p>
                </StatTile>
                <StatTile label="Unpaid rewards" accent="neon">
                  <p className="text-2xl sm:text-3xl font-black font-mono text-neon tabular-nums">
                    {unpaidAmt.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    paid {(userStats?.paidAmount ?? 0).toLocaleString()} ·{" "}
                    {userStats?.paidCount ?? 0} done
                  </p>
                </StatTile>
                <StatTile label="Your handle" accent="amber">
                  <p className="text-base sm:text-lg font-mono text-zinc-200 truncate">
                    @{twitterHandle}
                  </p>
                </StatTile>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {wallet ? (
                  <span className="font-mono text-zinc-400 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-border">
                    {wallet.slice(0, 4)}…{wallet.slice(-4)}
                  </span>
                ) : (
                  <span className="text-amber-400 text-[11px]">
                    Solana wallet not ready — re-login if this sticks
                  </span>
                )}
                {referralLink && (
                  <button
                    type="button"
                    onClick={copyLink}
                    className="text-[11px] font-mono text-neon-blue hover:underline"
                  >
                    {copied ? "Copied link" : "Copy raw link"}
                  </button>
                )}
              </div>

              <ShareRefButton path="/" handle={twitterHandle} />

              <button
                type="button"
                onClick={claimRewards}
                disabled={
                  claimBusy || !wallet || (userStats?.unpaidCount ?? 0) === 0
                }
                className="w-full min-h-12 sm:min-h-14 rounded-xl bg-neon text-black text-sm sm:text-base font-bold font-orbitron uppercase tracking-wide hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed transition shadow-[0_0_28px_rgba(57,255,20,0.15)]"
              >
                {claimBusy
                  ? "Paying…"
                  : !wallet
                    ? "Waiting for wallet…"
                    : (userStats?.unpaidCount ?? 0) === 0
                      ? "Nothing to claim"
                      : `Claim ${unpaidAmt.toLocaleString()} $${SHIT_SYMBOL}`}
              </button>

              {claimMsg && (
                <p className="text-sm text-green-400 border border-green-900/40 bg-green-950/30 rounded-xl px-3 py-2">
                  {claimMsg}
                </p>
              )}
              {claimErr && (
                <p className="text-sm text-red-400 border border-red-900/40 bg-red-950/30 rounded-xl px-3 py-2">
                  {claimErr}
                </p>
              )}

              {userStats && userStats.referrals.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <h3 className="text-[10px] font-orbitron uppercase tracking-[0.16em] text-zinc-500 mb-3">
                    Recent referrals
                  </h3>
                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                    {userStats.referrals.map((ref, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-zinc-950/50 px-3 py-2.5"
                      >
                        <a
                          href={`https://x.com/${ref.referred_twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-zinc-300 font-mono truncate hover:text-neon"
                        >
                          @{ref.referred_twitter}
                        </a>
                        <div className="flex items-center gap-2 shrink-0">
                          {ref.paid ? (
                            <span className="text-[10px] font-mono text-neon bg-neon/10 border border-neon/30 rounded-md px-1.5 py-0.5">
                              paid
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400/90 bg-amber-400/10 border border-amber-500/30 rounded-md px-1.5 py-0.5">
                              unpaid
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-600 tabular-nums">
                            {new Date(
                              ref.created_at +
                                (ref.created_at.includes("T") ? "" : "Z")
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Leaderboard */}
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <EmojiIcon size={18}>🏆</EmojiIcon>
              <h2 className="text-sm font-bold font-orbitron uppercase tracking-wide text-zinc-200">
                Top shit spreaders
              </h2>
            </div>
            <span className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-600">
              {REFERRAL_REWARD_SHIT.toLocaleString()} ${SHIT_SYMBOL} each
            </span>
          </div>

          {loading ? (
            <div className="px-4 py-10 flex justify-center">
              <BalanceSkeleton className="h-4 w-32" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-zinc-500">
              No referrals yet. Be the first!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[320px]">
                <caption className="sr-only">
                  Referral leaderboard by signup count
                </caption>
                <thead>
                  <tr className="border-b border-border text-zinc-500 text-[10px] font-orbitron uppercase tracking-wider">
                    <th scope="col" className="text-left px-4 py-3 font-medium">
                      Rank
                    </th>
                    <th scope="col" className="text-left px-4 py-3 font-medium">
                      Handle
                    </th>
                    <th
                      scope="col"
                      className="text-right px-4 py-3 font-medium"
                    >
                      Refs
                    </th>
                    <th
                      scope="col"
                      className="text-right px-4 py-3 font-medium"
                    >
                      ${SHIT_SYMBOL}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={entry.username + index}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-400 w-5 tabular-nums">
                            {index + 1}
                          </span>
                          {index === 0 && (
                            <EmojiIcon size={16}>🥇</EmojiIcon>
                          )}
                          {index === 1 && (
                            <EmojiIcon size={16}>🥈</EmojiIcon>
                          )}
                          {index === 2 && (
                            <EmojiIcon size={16}>🥉</EmojiIcon>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://x.com/${entry.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-zinc-200 hover:text-neon font-mono"
                        >
                          @{entry.username}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-white tabular-nums">
                        {entry.referralCount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-neon tabular-nums">
                        {(
                          (Number(entry.referralCount) || 0) *
                          REFERRAL_REWARD_SHIT
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-center text-[11px] text-zinc-600 pb-2">
          <Link href="/claim" className="text-neon-blue hover:underline">
            Claim rewards
          </Link>
          <span className="mx-2 text-zinc-700">·</span>
          <Link href="/play" className="text-zinc-500 hover:text-white">
            Play
          </Link>
        </p>
      </div>
    </div>
  );
}
