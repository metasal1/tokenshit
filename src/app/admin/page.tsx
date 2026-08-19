"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { EmojiIcon } from "@/components/EmojiIcon";
import Link from "next/link";

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
  kolNoms?: {
    id: number;
    handle: string;
    note: string | null;
    byX: string | null;
    status: string;
    createdAt: string;
    followers?: number | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    source?: string | null;
  }[];
}

type Tab = "users" | "voters" | "referrals" | "kols";

/**
 * Admin UI — data only loads after server allowlist (ADMIN_PRIVY_ID) accepts
 * the Privy token. No client-side Twitter-handle gate.
 */
export default function AdminPage() {
  const { ready, authenticated, user, login, logout, getAccessToken } =
    usePrivy();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("users");
  const [myId, setMyId] = useState<string | null>(null);
  const [kolBusy, setKolBusy] = useState<number | null>(null);
  const [kolFilter, setKolFilter] = useState<"pending" | "all" | "accepted" | "rejected" | "live">("pending");
  const [kolRows, setKolRows] = useState<AdminData["kolNoms"]>([]);

  useEffect(() => {
    if (user?.id) setMyId(user.id);
  }, [user?.id]);

  // Deep link: /admin?tab=kols
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("tab") || "";
      const tq = q.toLowerCase();
      if (tq === "kols" || tq === "kol") setTab("kols");
      else if (tq === "voters") setTab("voters");
      else if (tq === "referrals") setTab("referrals");
    } catch {
      /* */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No session token");
      const res = await fetch("/api/admin/data", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.status === 403) {
        const d = await res.json().catch(() => ({}));
        throw new Error(
          (d as { error?: string }).error ||
            "Forbidden — your Privy id is not in ADMIN_PRIVY_ID"
        );
      }
      if (res.status === 503) {
        throw new Error("Admin not configured (set ADMIN_PRIVY_ID secret)");
      }
      if (res.status === 401) {
        const d = await res.json().catch(() => ({}));
        throw new Error(
          (d as { error?: string }).error ||
            "Unauthorized — log out and log back in"
        );
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(
          (d as { error?: string }).error || `HTTP ${res.status}`
        );
      }
      const json = (await res.json()) as AdminData;
      setData(json);
      setKolRows(json.kolNoms || []);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  const loadKols = useCallback(async (filter = kolFilter) => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch(`/api/admin/kols?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return;
      const j = (await res.json()) as { noms?: AdminData["kolNoms"] };
      setKolRows(j.noms || []);
    } catch {
      /* */
    }
  }, [getAccessToken, kolFilter]);

  async function actKol(id: number, action: "accept" | "reject" | "live" | "pending") {
    setKolBusy(id);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No session");
      const res = await fetch("/api/admin/kols", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, action }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { error?: string }).error || `HTTP ${res.status}`);
      await loadKols(kolFilter);
      // refresh main dump counts
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "KOL action failed");
    } finally {
      setKolBusy(null);
    }
  }


  useEffect(() => {
    if (!ready || !authenticated) return;
    void load();
  }, [ready, authenticated, load]);

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-500 text-sm">
        Loading…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-neon">
            Admin
          </p>
          <p className="text-zinc-400 text-sm">
            Sign in with the allowlisted Privy account.
          </p>
          <button
            type="button"
            onClick={() => login()}
            className="px-4 py-2.5 rounded-xl bg-neon text-black text-sm font-bold hover:brightness-110"
          >
            Sign in
          </button>
          <p className="text-[10px] text-zinc-600">
            <Link href="/" className="hover:text-neon">
              ← Home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3 max-w-md">
          <p className="text-red-400 text-sm font-mono">{error}</p>
          {myId && (
            <p className="text-[11px] text-zinc-500 font-mono break-all">
              Your id: {myId}
            </p>
          )}
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => void load()}
              className="px-3 py-2 rounded-lg border border-border text-xs text-zinc-300"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="px-3 py-2 rounded-lg border border-border text-xs text-zinc-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      key: "users",
      label: `Users (${data?.users.length ?? "…"})`,
      icon: <EmojiIcon size={16}>👥</EmojiIcon>,
    },
    {
      key: "voters",
      label: `Voters (${data?.voters.length ?? "…"})`,
      icon: <EmojiIcon size={16}>📈</EmojiIcon>,
    },
    {
      key: "referrals",
      label: `Referrals (${data?.referrals.length ?? "…"})`,
      icon: <EmojiIcon size={16}>🔗</EmojiIcon>,
    },
    {
      key: "kols",
      label: "KOLs",
      icon: <EmojiIcon size={16}>🕵️</EmojiIcon>,
      count: (kolRows || data?.kolNoms || []).filter((n) => n.status === "pending")
        .length,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-16">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-neon">
            Internal
          </p>
          <h1 className="text-2xl font-black font-mono text-neon">ADMIN</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-50"
          >
            <span
              className={`emoji inline-block text-sm ${loading ? "animate-spin" : ""}`}
              aria-hidden
            >
              🔄
            </span>
            Refresh
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="text-xs px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-600"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 font-mono bg-red-950/20 border border-red-900/40 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Email signups", value: data.stats.signups },
            { label: "Total votes", value: data.stats.totalVotes },
            { label: "Unique voters", value: data.stats.uniqueVoters },
            { label: "Referrals", value: data.stats.referrals },
            {
              label: "KOL pending",
              value: (kolRows || data.kolNoms || []).filter(
                (n) => n.status === "pending"
              ).length,
              tab: "kols" as Tab,
            },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                if ("tab" in s && s.tab) {
                  setTab(s.tab);
                  void loadKols("pending");
                }
              }}
              className={`rounded-xl border bg-card p-4 text-left transition-colors ${
                "tab" in s && s.tab
                  ? "border-amber-500/40 hover:border-amber-400/70 cursor-pointer"
                  : "border-border cursor-default"
              }`}
            >
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p
                className={`text-2xl font-black font-mono ${
                  "tab" in s && s.tab ? "text-amber-300" : "text-foreground"
                }`}
              >
                {Number(s.value).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              if (t.key === "kols") void loadKols(kolFilter);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t.key
                ? "bg-neon text-black"
                : "border border-border text-zinc-400 hover:text-foreground"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {typeof t.count === "number" ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${
                  tab === t.key
                    ? "bg-black/20 text-black"
                    : t.count > 0
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {loading && !data && (
        <div className="text-center py-16 text-zinc-600 text-sm animate-pulse">
          Loading…
        </div>
      )}

      {data && tab === "users" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Email signups</caption>
              <thead>
                <tr className="border-b border-border bg-card text-xs text-zinc-500">
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">
                    Email
                  </th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">
                    Twitter
                  </th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">
                    Wallet
                  </th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">
                    Source
                  </th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">
                    Signed up
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-zinc-600"
                    >
                      No signups yet
                    </td>
                  </tr>
                )}
                {data.users.map((u, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0 hover:bg-card/80"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">
                      {u.email as string}
                    </td>
                    <td className="px-4 py-2.5">
                      {u.twitter ? (
                        <a
                          href={`https://x.com/${u.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neon-blue hover:underline text-xs"
                        >
                          @{u.twitter as string}
                        </a>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {u.wallet ? (
                        <span className="text-xs text-zinc-400 font-mono">
                          {String(u.wallet).slice(0, 6)}…
                          {String(u.wallet).slice(-4)}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-500">
                      {(u.source as string) || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-600 font-mono">
                      {String(u.createdAt).slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && tab === "voters" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Voters</caption>
              <thead>
                <tr className="border-b border-border bg-card text-xs text-zinc-500">
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">
                    Voter
                  </th>
                  <th scope="col" className="text-right px-4 py-2.5 font-medium">
                    Total
                  </th>
                  <th scope="col" className="text-right px-4 py-2.5 font-medium">
                    HIT
                  </th>
                  <th scope="col" className="text-right px-4 py-2.5 font-medium">
                    SHIT
                  </th>
                  <th scope="col" className="text-right px-4 py-2.5 font-medium">
                    Last
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.voters.map((v, i) => {
                  const id = String(v.voterId);
                  return (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-card/80"
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">
                        {id.length > 16 ? `${id.slice(0, 10)}…` : id}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold">
                        {Number(v.total)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-green-400">
                        {Number(v.hits)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-red-400">
                        {Number(v.shits)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-600 font-mono">
                        {String(v.lastVote)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && tab === "referrals" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Referrals</caption>
              <thead>
                <tr className="border-b border-border bg-card text-xs text-zinc-500">
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">
                    Referrer
                  </th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">
                    Referred
                  </th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">
                    Wallet
                  </th>
                  <th scope="col" className="text-left px-4 py-2.5 font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.referrals.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0 hover:bg-card/80"
                  >
                    <td className="px-4 py-2.5 text-xs font-mono">
                      @{r.referrer as string}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono">
                      @{r.referred as string}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-400 font-mono">
                      {r.wallet
                        ? `${String(r.wallet).slice(0, 6)}…${String(r.wallet).slice(-4)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-600 font-mono">
                      {String(r.createdAt).slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "kols" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-zinc-500 font-mono flex-1">
              Submissions → Turso <code className="text-neon">kol_nominations</code>. Accept = shortlist · Live = on roster · Reject = no.
            </p>
            {(["pending", "accepted", "live", "rejected", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setKolFilter(f);
                  void loadKols(f);
                }}
                className={`rounded-full px-2.5 py-1 text-[10px] font-orbitron uppercase tracking-wide border ${
                  kolFilter === f
                    ? "border-neon text-neon bg-neon/10"
                    : "border-zinc-700 text-zinc-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950/80 text-zinc-500 text-xs font-orbitron uppercase">
                <tr>
                  <th className="text-left px-3 py-2">ID</th>
                  <th className="text-left px-3 py-2">Handle</th>
                  <th className="text-left px-3 py-2">Card link</th>
                  <th className="text-left px-3 py-2">Followers</th>
                  <th className="text-left px-3 py-2">By</th>
                  <th className="text-left px-3 py-2">Note</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(kolRows || []).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-zinc-600 text-xs">
                      No nominations in this filter
                    </td>
                  </tr>
                ) : (
                  (kolRows || []).map((n) => (
                    <tr key={n.id} className="border-t border-border hover:bg-card/80">
                      <td className="px-3 py-2 font-mono text-xs text-zinc-500">{n.id}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        <a
                          href={`https://x.com/${n.handle}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neon hover:underline"
                        >
                          @{n.handle}
                        </a>
                        {n.displayName ? (
                          <div className="text-[10px] text-zinc-500 truncate max-w-[9rem]">
                            {n.displayName}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px]">
                        <div className="flex flex-col gap-1 min-w-[9rem]">
                          <a
                            href={`/kols/${encodeURIComponent(n.handle)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 hover:underline break-all"
                            title={`https://tokenshit.com/kols/${n.handle}`}
                          >
                            /kols/{n.handle}
                          </a>
                          <button
                            type="button"
                            className="text-left text-[10px] text-zinc-500 hover:text-neon"
                            onClick={() => {
                              const url = `https://tokenshit.com/kols/${n.handle}`;
                              void navigator.clipboard.writeText(url).then(
                                () => setError(null),
                                () => setError("Copy failed")
                              );
                              // brief inline feedback via error slot is noisy — use status on button
                              const el = document.getElementById(`kol-copy-${n.id}`);
                              if (el) {
                                el.textContent = "Copied ✓";
                                window.setTimeout(() => {
                                  el.textContent = "Copy deep link";
                                }, 1500);
                              }
                            }}
                          >
                            <span id={`kol-copy-${n.id}`}>Copy deep link</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-neon tabular-nums">
                        {n.followers != null ? Number(n.followers).toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-zinc-400">
                        {n.byX ? `@${n.byX}` : "—"}
                        {n.source ? (
                          <div className="text-[9px] text-zinc-600">{n.source}</div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-xs text-zinc-500 max-w-[12rem] truncate" title={n.note || ""}>
                        {n.note || "—"}
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px] uppercase text-amber-300/90">
                        {n.status}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <a
                            href={`/kols/${encodeURIComponent(n.handle)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-sky-700/60 px-2 py-1 text-[10px] text-sky-300 hover:border-sky-400"
                          >
                            Open card
                          </a>
                          <button
                            type="button"
                            disabled={kolBusy === n.id}
                            onClick={() => void actKol(n.id, "accept")}
                            className="rounded-md bg-neon/90 px-2 py-1 text-[10px] font-bold text-black disabled:opacity-40"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={kolBusy === n.id}
                            onClick={() => void actKol(n.id, "live")}
                            className="rounded-md border border-neon/40 px-2 py-1 text-[10px] text-neon disabled:opacity-40"
                          >
                            Live
                          </button>
                          <button
                            type="button"
                            disabled={kolBusy === n.id}
                            onClick={() => void actKol(n.id, "reject")}
                            className="rounded-md border border-red-800 px-2 py-1 text-[10px] text-red-300 disabled:opacity-40"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
