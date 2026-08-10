"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ARENA_TABS } from "@/lib/lists";

interface LeaderEntry {
  assetId: string;
  hits: number;
  shits: number;
  name?: string;
  symbol?: string;
  logo?: string;
  category?: string;
}

export default function CategoryLeaderboard({
  mostHit,
  mostShit,
  categoryMap,
}: {
  mostHit: LeaderEntry[];
  mostShit: LeaderEntry[];
  categoryMap: Record<string, string>;
}) {
  const [arena, setArena] = useState<string>("all");

  const filter = (entries: LeaderEntry[]) => {
    if (arena === "all") return entries;
    return entries.filter((e) => {
      const cat = e.category || categoryMap[e.assetId];
      // Staking arena: SOL bag (LST parent) + anything tagged lsts
      if (arena === "lsts") return e.assetId === "solana" || cat === "lsts";
      return cat === arena;
    });
  };

  const hits = filter(mostHit).slice(0, 5);
  const shits = filter(mostShit).slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ARENA_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setArena(t.key)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              arena === t.key
                ? "bg-neon text-black"
                : "bg-card border border-border text-zinc-400 hover:text-foreground hover:border-zinc-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {hits.length === 0 && shits.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 py-8 border border-dashed border-border rounded-xl">
          No votes in this arena yet. Be first.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeaderList title="Most HIT" subtitle="This arena" entries={hits} type="hit" />
          <LeaderList title="Most SHIT" subtitle="This arena" entries={shits} type="shit" />
        </div>
      )}
    </div>
  );
}

function LeaderList({
  title,
  subtitle,
  entries,
  type,
}: {
  title: string;
  subtitle: string;
  entries: LeaderEntry[];
  type: "hit" | "shit";
}) {
  const color = type === "hit" ? "text-green-400" : "text-red-400";
  const bgHover = type === "hit" ? "hover:bg-green-500/5" : "hover:bg-red-500/5";

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-zinc-500 text-center">
        No {type === "hit" ? "hits" : "shits"} yet
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-bold text-foreground">{title}</h3>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
      <div className="divide-y divide-border">
        {entries.map((e, i) => (
          <Link
            key={`${e.assetId}-${i}`}
            href={`/token/${encodeURIComponent(e.assetId)}`}
            className={`flex items-center gap-3 px-4 py-3 transition-colors ${bgHover}`}
          >
            <span className="text-lg font-bold text-zinc-600 w-6 text-center font-mono">
              {i + 1}
            </span>
            {e.logo ? (
              <img
                src={e.logo}
                alt={e.symbol || ""}
                className="h-8 w-8 rounded-full bg-zinc-800"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                {(e.symbol || "?").slice(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground text-sm truncate">
                {e.name || e.assetId}
              </div>
              <div className="text-xs text-zinc-500 font-mono uppercase">{e.symbol}</div>
            </div>
            <div className={`font-mono font-bold ${color}`}>
              {type === "hit" ? e.hits : e.shits}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Client-only fallback if parent only has global lists */
export function CategoryLeaderboardLoader() {
  const [data, setData] = useState<{
    mostHit: LeaderEntry[];
    mostShit: LeaderEntry[];
    categoryMap: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/votes/leaderboard?withCategories=1")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ mostHit: [], mostShit: [], categoryMap: {} }));
  }, []);

  if (!data) {
    return <p className="text-center text-zinc-500 text-sm py-6">Loading arenas…</p>;
  }
  return (
    <CategoryLeaderboard
      mostHit={data.mostHit}
      mostShit={data.mostShit}
      categoryMap={data.categoryMap}
    />
  );
}
