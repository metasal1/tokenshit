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
import { PlayMatchShell } from "@/components/PlayMatchShell";
import { referralClaimLocked } from "@/lib/wallet-balance-parse";

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
  detail?: boolean;
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
    <div
      className={`rounded-xl border ${ring} p-3 min-h-[5.25rem] flex flex-col gap-1.5`}
    >
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
      void (async () => {
        try {
          const token = await getAccessToken();
          const headers: Record<string, string> = {};
          if (token) {
            headers.Authorization = `Bearer ${token}`;
            headers["x-privy-token"] = token;
          }
          const r = await fetch(
            `/api/referral/stats?username=${encodeURIComponent(handle)}`,
            { headers, cache: "no-store" }
          );
          const d = await r.json();
          setUserStats(d);
        } catch {
          /* ignore */
        }
      })();
    }
  }, [authenticated, user, getAccessToken]);

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
        try {
          const t2 = await getAccessToken();
          const headers: Record<string, string> = {};
          if (t2) {
            headers.Authorization = `Bearer ${t2}`;
            headers["x-privy-token"] = t2;
          }
          const st = await fetch(
            `/api/referral/stats?username=${encodeURIComponent(twitterHandle)}`,
            { headers, cache: "no-store" }
          );
          const d = await st.json();
          setUserStats(d);
        } catch {
          /* ignore */
        }
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
    <PlayMatchShell
      title={<span className="neon-text">REFER</span>}
      titleAccent="earn $TOKENSHIT"
      links={[
        { href: "/play", label: "Play", primary: true },
        { href: "/memes", label: "Memes" },
        { href: "/boards", label: "Boards" },
      ]}
    >
      <div className="space-y-4 pb-4">
        <p className="text-[11px] text-zinc-500 leading-snug">
          Refer degens →{" "}
          <span className="text-neon font-mono font-semibold">
            {REFERRAL_REWARD_SHIT.toLocaleString()} ${SHIT_SYMBOL}
          </span>{" "}
          each when they join with your link.
        </p>

        {/* Logged-out CTA */}
        {!authenticated && (
          <section className="rounded-2xl border border-border bg-card p-5 text-center space-y-3">
            <EmojiIcon size={28}>🔗</EmojiIcon>
            <p className="text-sm text-zinc-400">
              Login with X to get your referral link and claim rewards.
            </p>
            <button
              type="button"
              onClick={() => login()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neon px-6 text-sm font-bold font-orbitron uppercase tracking-wide text-black hover:brightness-110 transition"
            >
              Login with X
            </button>
          </section>
        )}

        {/* Your stats */}
        {authenticated && twitterHandle && (
          <section className="rounded-2xl border border-neon/30 bg-gradient-to-b from-neon/10 via-card to-card overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/80">
              <div className="flex items-center gap-2">
                <EmojiIcon size={16}>👤</EmojiIcon>
                <h2 className="text-xs font-bold font-orbitron uppercase tracking-wide text-white">
                  Your referrals
                </h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                @{twitterHandle}
              </span>
            </div>

            <div className="p-3.5 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <StatTile label="Total">
                  <p className="text-2xl font-black font-mono text-white tabular-nums">
                    {userStats?.totalReferrals ?? 0}
                  </p>
                </StatTile>
                <StatTile label="Unpaid" accent="neon">
                  <p className="text-2xl font-black font-mono text-neon tabular-nums">
                    {unpaidAmt.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    paid {(userStats?.paidAmount ?? 0).toLocaleString()}
                  </p>
                </StatTile>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {wallet ? (
                  <span className="font-mono text-zinc-400 px-2 py-1 rounded-lg bg-zinc-950 border border-border text-[10px]">
                    {wallet.slice(0, 4)}…{wallet.slice(-4)}
                  </span>
                ) : (
                  <span className="text-amber-400 text-[11px]">
                    Solana wallet not ready
                  </span>
                )}
                {referralLink && (
                  <button
                    type="button"
                    onClick={copyLink}
                    className="text-[11px] font-mono text-neon-blue hover:underline"
                  >
                    {copied ? "Copied" : "Copy link"}
                  </button>
                )}
              </div>

              <ShareRefButton path="/" handle={twitterHandle} />

              <button
                type="button"
                onClick={claimRewards}
                disabled={
                  claimBusy ||
                  referralClaimLocked({
                    wallet,
                    unpaidCount: userStats?.unpaidCount,
                    detail: userStats?.detail,
                  })
                }
                className="w-full min-h-12 rounded-xl bg-neon text-black text-sm font-bold font-orbitron uppercase tracking-wide hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed transition"
              >
                {claimBusy
                  ? "Paying…"
                  : !wallet
                    ? "Waiting for wallet…"
                    : referralClaimLocked({
                        wallet,
                        unpaidCount: userStats?.unpaidCount,
                        detail: userStats?.detail,
                      })
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
                  <h3 className="text-[10px] font-orbitron uppercase tracking-[0.16em] text-zinc-500 mb-2">
                    Recent
                  </h3>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {userStats.referrals.map((ref, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-zinc-950/50 px-3 py-2"
                      >
                        <a
                          href={`https://x.com/${ref.referred_twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-300 font-mono truncate hover:text-neon"
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
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <EmojiIcon size={16}>🏆</EmojiIcon>
              <h2 className="text-xs font-bold font-orbitron uppercase tracking-wide text-zinc-200">
                Top spreaders
              </h2>
            </div>
            <span className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-600">
              {REFERRAL_REWARD_SHIT.toLocaleString()} each
            </span>
          </div>

          {loading ? (
            <div className="px-4 py-8 flex justify-center">
              <BalanceSkeleton className="h-4 w-32" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-500">
              No referrals yet. Be the first!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[280px]">
                <caption className="sr-only">
                  Referral leaderboard by signup count
                </caption>
                <thead>
                  <tr className="border-b border-border text-zinc-500 text-[10px] font-orbitron uppercase tracking-wider">
                    <th scope="col" className="text-left px-3 py-2.5 font-medium">
                      #
                    </th>
                    <th scope="col" className="text-left px-3 py-2.5 font-medium">
                      Handle
                    </th>
                    <th
                      scope="col"
                      className="text-right px-3 py-2.5 font-medium"
                    >
                      Refs
                    </th>
                    <th
                      scope="col"
                      className="text-right px-3 py-2.5 font-medium"
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
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-zinc-400 w-4 tabular-nums text-xs">
                            {index + 1}
                          </span>
                          {index === 0 && (
                            <EmojiIcon size={14}>🥇</EmojiIcon>
                          )}
                          {index === 1 && (
                            <EmojiIcon size={14}>🥈</EmojiIcon>
                          )}
                          {index === 2 && (
                            <EmojiIcon size={14}>🥉</EmojiIcon>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <a
                          href={`https://x.com/${entry.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-200 hover:text-neon font-mono"
                        >
                          @{entry.username}
                        </a>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-white tabular-nums text-xs">
                        {entry.referralCount}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-neon tabular-nums text-xs">
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
      </div>
    </PlayMatchShell>
  );
}
