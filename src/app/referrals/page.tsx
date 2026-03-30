'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';

interface LeaderboardEntry {
  username: string;
  count: number;
}

interface ReferralEntry {
  referred_twitter: string;
  created_at: string;
}

export default function ReferralsPage() {
  const { authenticated, user } = usePrivy();
  const twitterUsername = user?.twitter?.username?.toLowerCase();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<{ total: number; referrals: ReferralEntry[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/referral/leaderboard')
      .then(r => r.json())
      .then(d => setLeaderboard(d.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!twitterUsername) return;
    fetch(`/api/referral/stats?username=${encodeURIComponent(twitterUsername)}`)
      .then(r => r.json())
      .then(d => setMyStats({ total: d.totalReferrals, referrals: d.referrals || [] }))
      .catch(() => {});
  }, [twitterUsername]);

  const shareLink = twitterUsername ? `https://tokenshit.com/?ref=${twitterUsername}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">Spread the Shit 💩</h1>
      <p className="text-zinc-400 mb-8">
        Share TokenShit with your fellow degens. The more you spread, the higher you climb.
      </p>

      {/* Personal stats */}
      {authenticated && twitterUsername && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Your Referral Link</h2>
          <div className="flex gap-2 mb-4">
            <input
              readOnly
              value={shareLink}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 font-mono"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded-lg transition-colors shrink-0"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <p className="text-sm text-zinc-400">
            You&apos;ve referred <span className="text-white font-bold text-lg">{myStats?.total ?? 0}</span> degen{(myStats?.total ?? 0) !== 1 ? 's' : ''}
          </p>

          {myStats && myStats.referrals.length > 0 && (
            <div className="mt-4 space-y-1.5 max-h-[200px] overflow-y-auto">
              {myStats.referrals.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-3 py-2">
                  <span className="text-xs text-zinc-300">@{r.referred_twitter}</span>
                  <span className="text-[10px] text-zinc-600">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!authenticated && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-8 text-center">
          <p className="text-zinc-400 text-sm">Log in with Twitter to get your referral link</p>
        </div>
      )}

      {/* Leaderboard */}
      <h2 className="text-xl font-bold text-white mb-4">🏆 Top Shit Spreaders</h2>
      {loading ? (
        <p className="text-zinc-500 text-sm text-center py-8">Loading leaderboard...</p>
      ) : leaderboard.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">No referrals yet. Be the first shit spreader!</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, i) => (
            <div
              key={entry.username}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
            >
              <span className="text-lg w-8 text-center shrink-0">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-sm text-zinc-500">#{i + 1}</span>}
              </span>
              <span className="text-sm text-zinc-300 flex-1">@{entry.username}</span>
              <span className="text-sm font-bold text-white">{entry.count}</span>
              <span className="text-xs text-zinc-500">referral{entry.count !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
