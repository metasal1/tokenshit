"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { EmojiIcon } from "@/components/EmojiIcon";

interface AdminData {
  stats: {
    signups: number;
    totalVotes: number;
    uniqueVoters: number;
    referrals: number;
  };
  users: {
    email: string;
    twitter: string | null;
    wallet: string | null;
    source: string | null;
    createdAt: string;
  }[];
  voters: {
    voterId: string;
    total: number;
    hits: number;
    shits: number;
    lastVote: string;
  }[];
  referrals: {
    referrer: string;
    referred: string;
    wallet: string | null;
    createdAt: string;
  }[];
}

type Tab = "users" | "voters" | "referrals";

const ADMIN_HANDLE = "tokenshit_";

export default function AdminPage() {
  const { ready, authenticated, user, login, getAccessToken } = usePrivy();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("users");

  const twitterHandle = user?.twitter?.username?.toLowerCase();
  const isAdmin = twitterHandle === ADMIN_HANDLE;

  useEffect(() => {
    if (!isAdmin) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/admin/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      setData(await res.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">Sign in to access admin</p>
          <button
            onClick={() => login()}
            className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors text-sm"
          >
            Sign in with X
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-sm font-mono">403 — not your page, degen</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "users", label: `Users (${data?.users.length ?? "…"})`, icon: <EmojiIcon size={16}>👥</EmojiIcon> },
    { key: "voters", label: `Voters (${data?.voters.length ?? "…"})`, icon: <EmojiIcon size={16}>📈</EmojiIcon> },
    { key: "referrals", label: `Referrals (${data?.referrals.length ?? "…"})`, icon: <EmojiIcon size={16}>🔗</EmojiIcon> },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black font-mono text-neon">ADMIN</h1>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 font-mono bg-red-950/20 border border-red-900/40 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Stats row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Email signups", value: data.stats.signups },
            { label: "Total votes", value: data.stats.totalVotes },
            { label: "Unique voters", value: data.stats.uniqueVoters },
            { label: "Referrals", value: data.stats.referrals },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p className="text-2xl font-black font-mono text-foreground">{Number(s.value).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t.key
                ? "bg-neon text-black"
                : "border border-border text-zinc-400 hover:text-foreground hover:border-zinc-600"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading && !data && (
        <div className="text-center py-16 text-zinc-600 text-sm animate-pulse">Loading…</div>
      )}

      {/* Users table */}
      {data && tab === "users" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card text-xs text-zinc-500">
                  <th className="text-left px-4 py-2.5 font-medium">Email</th>
                  <th className="text-left px-4 py-2.5 font-medium">Twitter</th>
                  <th className="text-left px-4 py-2.5 font-medium">Wallet</th>
                  <th className="text-left px-4 py-2.5 font-medium">Source</th>
                  <th className="text-left px-4 py-2.5 font-medium">Signed up</th>
                </tr>
              </thead>
              <tbody>
                {data.users.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No signups yet</td></tr>
                )}
                {data.users.map((u, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-card transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{u.email as string}</td>
                    <td className="px-4 py-2.5">
                      {u.twitter ? (
                        <a href={`https://x.com/${u.twitter}`} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline text-xs">
                          @{u.twitter as string}
                        </a>
                      ) : <span className="text-zinc-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      {u.wallet ? (
                        <span className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                          <EmojiIcon size={16}>💳</EmojiIcon>
                          {String(u.wallet).slice(0, 6)}…{String(u.wallet).slice(-4)}
                        </span>
                      ) : <span className="text-zinc-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-500">{u.source as string || "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-zinc-600 font-mono">{String(u.createdAt).slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Voters table */}
      {data && tab === "voters" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card text-xs text-zinc-500">
                  <th className="text-left px-4 py-2.5 font-medium">Voter ID</th>
                  <th className="text-right px-4 py-2.5 font-medium">Total</th>
                  <th className="text-right px-4 py-2.5 font-medium">HIT</th>
                  <th className="text-right px-4 py-2.5 font-medium">SHIT</th>
                  <th className="text-right px-4 py-2.5 font-medium">Last vote</th>
                </tr>
              </thead>
              <tbody>
                {data.voters.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No votes yet</td></tr>
                )}
                {data.voters.map((v, i) => {
                  const id = String(v.voterId);
                  const isTwitter = !id.includes("-") || id.startsWith("@");
                  return (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-card transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">
                        {isTwitter ? (
                          <a href={`https://x.com/${id}`} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">
                            @{id}
                          </a>
                        ) : (
                          <span title={id}>{id.slice(0, 8)}…</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-white">{Number(v.total)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-green-400">{Number(v.hits)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-red-400">{Number(v.shits)}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-600 font-mono">{String(v.lastVote)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Referrals table */}
      {data && tab === "referrals" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card text-xs text-zinc-500">
                  <th className="text-left px-4 py-2.5 font-medium">Referrer</th>
                  <th className="text-left px-4 py-2.5 font-medium">Referred</th>
                  <th className="text-left px-4 py-2.5 font-medium">Wallet</th>
                  <th className="text-left px-4 py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.referrals.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600">No referrals yet</td></tr>
                )}
                {data.referrals.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-card transition-colors">
                    <td className="px-4 py-2.5">
                      <a href={`https://x.com/${r.referrer}`} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline text-xs font-mono">
                        @{r.referrer as string}
                      </a>
                    </td>
                    <td className="px-4 py-2.5">
                      <a href={`https://x.com/${r.referred}`} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline text-xs font-mono">
                        @{r.referred as string}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-400 font-mono">
                      {r.wallet ? `${String(r.wallet).slice(0, 6)}…${String(r.wallet).slice(-4)}` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-600 font-mono">{String(r.createdAt).slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
