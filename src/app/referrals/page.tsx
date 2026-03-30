'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';

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
  const { authenticated, user } = usePrivy();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch leaderboard
    fetch('/api/referral/leaderboard')
      .then(r => r.json())
      .then(d => setLeaderboard(d.leaderboard || []))
      .catch(e => console.error('Failed to fetch leaderboard:', e))
      .finally(() => setLoading(false));

    // Fetch user stats if authenticated
    if (authenticated && user?.twitter?.username) {
      fetch(`/api/referral/stats?username=${encodeURIComponent(user.twitter.username)}`)
        .then(r => r.json())
        .then(d => setUserStats(d))
        .catch(e => console.error('Failed to fetch user stats:', e));
    }
  }, [authenticated, user]);

  const twitterHandle = user?.twitter?.username;
  const referralLink = twitterHandle ? `https://tokenshit.com/?ref=${twitterHandle}` : null;

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Spread the Shit 💩</h1>
          <p className="text-zinc-400">Refer your degens and earn bragging rights</p>
        </div>

        {/* User's Referral Stats */}
        {authenticated && twitterHandle && (
          <div className="mb-12 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Referral Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-500 text-sm mb-1">Total Referrals</p>
                <p className="text-3xl font-bold text-white">{userStats?.totalReferrals ?? 0}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-500 text-sm mb-1">Your Handle</p>
                <p className="text-lg font-mono text-zinc-300">@{twitterHandle}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-500 text-sm mb-1">Share Link</p>
                <button
                  onClick={copyLink}
                  className="text-sm text-neon-blue hover:text-white transition-colors font-mono break-all text-left"
                >
                  {copied ? '✓ Copied!' : 'tokenshit.com/?ref=...'}
                </button>
              </div>
            </div>

            <button
              onClick={copyLink}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {copied ? '✓ Link Copied!' : 'Copy Your Referral Link'}
            </button>

            {/* Recent Referrals */}
            {userStats && userStats.referrals.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">Your Recent Referrals</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {userStats.referrals.map((ref, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-800/30 rounded px-3 py-2">
                      <span className="text-sm text-zinc-300 font-mono">@{ref.referred_twitter}</span>
                      <span className="text-xs text-zinc-600">{new Date(ref.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Leaderboard */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Top Shit Spreaders 🏆</h2>
          {loading ? (
            <div className="text-center py-8 text-zinc-400">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">No referrals yet. Be the first!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Rank</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Handle</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">Referrals</th>
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
                          {index > 2 && <span className="text-lg">💩</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://twitter.com/${entry.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neon-blue hover:underline font-mono text-sm"
                        >
                          @{entry.username}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-white text-lg">{entry.referralCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CTA */}
        {!authenticated && (
          <div className="mt-12 bg-gradient-to-r from-blue-900 to-purple-900 border border-zinc-700 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Want in on the action?</h3>
            <p className="text-zinc-400 mb-4">Log in with Twitter to start earning referrals</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
