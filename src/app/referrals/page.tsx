'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import Link from 'next/link';
import { REFERRAL_REWARD_SHIT, SHIT_SYMBOL } from '@/lib/shit-token';
import ShareRefButton from '@/components/ShareRefButton';
import ShitBalanceBadge from '@/components/ShitBalanceBadge';
import { pickSolanaAddress } from '@/lib/privy-identity';

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
    fetch('/api/referral/leaderboard')
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
  const potential = (userStats?.totalReferrals ?? 0) * REFERRAL_REWARD_SHIT;

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
      setClaimErr('Need X login + Solana wallet');
      return;
    }
    setClaimBusy(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setClaimErr('Session missing — log out and log back in');
        return;
      }
      const res = await fetch('/api/referral/claim-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-privy-token': token,
        },
        body: JSON.stringify({
          twitter: twitterHandle,
          wallet,
          accessToken: token,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail =
          typeof data.detail === 'string'
            ? ` (${data.detail})`
            : data.meta?.errors
              ? ` (${JSON.stringify(data.meta.errors).slice(0, 120)})`
              : '';
        setClaimErr((data.error || 'Claim failed') + detail);
        return;
      }
      if (data.errors?.length) {
        setClaimErr(data.errors.join('; '));
      }
      setClaimMsg(
        data.paid
          ? `Paid ${Number(data.amount).toLocaleString()} $${'TOKENSHIT'} for ${data.paid} referral(s)`
          : data.message || 'Nothing to claim'
      );
      // refresh stats
      if (twitterHandle) {
        fetch(`/api/referral/stats?username=${encodeURIComponent(twitterHandle)}`)
          .then((r) => r.json())
          .then((d) => setUserStats(d))
          .catch(() => {});
      }
    } catch (e) {
      setClaimErr(String(e));
    } finally {
      setClaimBusy(false);
    }
  }

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white">Spread the Shit</h1>
            <ShitBalanceBadge />
          </div>
          <p className="text-zinc-400">
            Refer degens → earn{' '}
            <span className="text-neon font-mono">
              {REFERRAL_REWARD_SHIT.toLocaleString()} ${SHIT_SYMBOL}
            </span>{' '}
            each
          </p>
        </div>

        {authenticated && twitterHandle && (
          <div className="mb-12 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Referral Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-500 text-sm mb-1">Wallet ${SHIT_SYMBOL}</p>
                <div className="mt-1">
                  <ShitBalanceBadge className="!min-h-10 !px-3 !text-sm !border-neon/40" />
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-500 text-sm mb-1">Total Referrals</p>
                <p className="text-3xl font-bold text-white">
                  {userStats?.totalReferrals ?? 0}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-500 text-sm mb-1">Unpaid rewards</p>
                <p className="text-3xl font-bold text-neon font-mono">
                  {((userStats?.unpaidCount ?? 0) * REFERRAL_REWARD_SHIT).toLocaleString()}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  paid {(userStats?.paidAmount ?? 0).toLocaleString()} · {userStats?.paidCount ?? 0} done
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-500 text-sm mb-1">Your Handle</p>
                <p className="text-lg font-mono text-zinc-300">@{twitterHandle}</p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              {wallet ? (
                <span className="font-mono text-zinc-400 px-2 py-1 rounded bg-zinc-800 border border-zinc-700">
                  {wallet.slice(0, 4)}…{wallet.slice(-4)}
                </span>
              ) : (
                <span className="text-amber-400">Solana wallet not ready — re-login if this sticks</span>
              )}
            </div>
            <div className="mb-4">
              <ShareRefButton path="/" handle={twitterHandle} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={claimRewards}
                disabled={claimBusy || !wallet || (userStats?.unpaidCount ?? 0) === 0}
                className="flex-1 bg-neon text-black hover:brightness-110 font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {claimBusy
                  ? 'Paying…'
                  : !wallet
                    ? 'Waiting for wallet…'
                    : (userStats?.unpaidCount ?? 0) === 0
                      ? 'Nothing to claim'
                      : `Claim ${(userStats?.unpaidCount ?? 0) * REFERRAL_REWARD_SHIT} $TOKENSHIT`}
              </button>
            </div>
            {claimMsg && <p className="text-sm text-green-400 mb-2">{claimMsg}</p>}
            {claimErr && <p className="text-sm text-red-400 mb-2">{claimErr}</p>}

            {userStats && userStats.referrals.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                  Your Recent Referrals
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {userStats.referrals.map((ref, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 bg-zinc-800/30 rounded px-3 py-2"
                    >
                      <span className="text-sm text-zinc-300 font-mono truncate">
                        @{ref.referred_twitter}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {ref.paid ? (
                          <span className="text-[10px] font-mono text-neon bg-neon/10 border border-neon/30 rounded px-1.5 py-0.5">
                            paid
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400/90 bg-amber-400/10 border border-amber-500/30 rounded px-1.5 py-0.5">
                            unpaid
                          </span>
                        )}
                        <span className="text-xs text-zinc-600">
                          {new Date(ref.created_at + (ref.created_at.includes('T') ? '' : 'Z')).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!authenticated && (
          <div className="mb-12 rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center">
            <p className="text-zinc-400 mb-4">
              Login with X to get your referral link and claim rewards.
            </p>
            <button
              onClick={() => login()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg"
            >
              Login
            </button>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Top Shit Spreaders 🏆
          </h2>
          {loading ? (
            <div className="text-center py-8 text-zinc-400">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              No referrals yet. Be the first!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">
                      Rank
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">
                      Handle
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">
                      Referrals
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">
                      $SHIT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={index}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white w-6">{index + 1}</span>
                          {index === 0 && <span className="text-lg">🥇</span>}
                          {index === 1 && <span className="text-lg">🥈</span>}
                          {index === 2 && <span className="text-lg">🥉</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://twitter.com/${entry.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-zinc-200 hover:text-white font-mono"
                        >
                          @{entry.username}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-white">
                        {entry.referralCount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-neon">
                        {(
                          (Number(entry.referralCount) || 0) * REFERRAL_REWARD_SHIT
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-zinc-600">
          <Link href="/claim" className="text-neon-blue hover:underline">
            Buy & claim $SHIT
          </Link>
        </p>
      </div>
    </div>
  );
}
