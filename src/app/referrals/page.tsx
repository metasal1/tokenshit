'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { REFERRAL_REWARD_SHIT } from '@/lib/shit-token';
import ShareRefButton from '@/components/ShareRefButton';

interface LeaderboardEntry {
  username: string;
  referralCount: number;
}

interface UserStats {
  totalReferrals: number;
  username: string;
  referrals: Array<{
    referred_twitter: string;
    created_at: string;
  }>;
}

export default function ReferralsPage() {
  const { authenticated, user, login } = usePrivy();
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
  const wallet = user?.wallet?.address;
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
      const res = await fetch('/api/referral/claim-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitter: twitterHandle, wallet }),
      });
      const data = await res.json();
      if (!res.ok) {
        setClaimErr(data.error || 'Claim failed');
        return;
      }
      setClaimMsg(
        data.paid
          ? `Paid ${Number(data.amount).toLocaleString()} $SHIT for ${data.paid} referral(s)`
          : data.message || 'Nothing to claim'
      );
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
          <h1 className="text-4xl font-bold text-white mb-2">Spread the Shit</h1>
          <p className="text-zinc-400">
            Refer degens → earn{' '}
            <span className="text-neon font-mono">
              {REFERRAL_REWARD_SHIT.toLocaleString()} $SHIT
            </span>{' '}
            each
          </p>
        </div>

        {authenticated && twitterHandle && (
          <div className="mb-12 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Referral Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-500 text-sm mb-1">Total Referrals</p>
                <p className="text-3xl font-bold text-white">
                  {userStats?.totalReferrals ?? 0}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-500 text-sm mb-1">Potential $SHIT</p>
                <p className="text-3xl font-bold text-neon font-mono">
                  {potential.toLocaleString()}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-500 text-sm mb-1">Your Handle</p>
                <p className="text-lg font-mono text-zinc-300">@{twitterHandle}</p>
              </div>
            </div>

            <div className="mb-4">
              <ShareRefButton path="/" handle={twitterHandle} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={claimRewards}
                disabled={claimBusy}
                className="flex-1 bg-neon text-black hover:brightness-110 font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {claimBusy ? 'Paying…' : 'Claim $TOKENSHIT rewards'}
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
                      className="flex items-center justify-between bg-zinc-800/30 rounded px-3 py-2"
                    >
                      <span className="text-sm text-zinc-300 font-mono">
                        @{ref.referred_twitter}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </span>
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
                          Number(entry.referralCount) * REFERRAL_REWARD_SHIT
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
