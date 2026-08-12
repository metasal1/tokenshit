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
  mostHit: initialHit = [],
  mostShit: initialShit = [],
  categoryMap: initialMap = {},
}: {
  mostHit?: LeaderEntry[];
  mostShit?: LeaderEntry[];
  categoryMap?: Record<string, string>;
}) {
  const [arena, setArena] = useState<string>("all");
  const [mostHit, setMostHit] = useState(initialHit);
  const [mostShit, setMostShit] = useState(initialShit);
  const [categoryMap, setCategoryMap] = useState(initialMap);
  const [loading, setLoading] = useState(initialHit.length === 0);

  useEffect(() => {
    let alive = true;
    // Always refresh in background; if no SSR data, show spinner
    fetch("/api/votes/leaderboard?withCategories=1&limit=15")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (Array.isArray(d.mostHit)) setMostHit(d.mostHit);
        if (Array.isArray(d.mostShit)) setMostShit(d.mostShit);
        if (d.categoryMap) setCategoryMap(d.categoryMap);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filter = (entries: LeaderEntry[]) => {
    if (arena === "all") return entries;
    return entries.filter((e) => {
      const cat = e.category || categoryMap[e.assetId];
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
            <span className="emoji mr-1">{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      ) : hits.length === 0 && shits.length === 0 ? (
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
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-baseline justify-between gap-2">
        <h3 className="font-bold text-foreground">{title}</h3>
        <span className="text-xs text-zinc-500">{subtitle}</span>
      </div>
      <ul className="divide-y divide-border">
        {entries.map((e, i) => {
          const label =
            e.name ||
            e.symbol ||
            (e.assetId.length > 16
              ? `${e.assetId.slice(0, 8)}…`
              : e.assetId);
          const score = type === "hit" ? e.hits : e.shits;
          return (
            <li key={e.assetId}>
              <Link
                href={`/token/${encodeURIComponent(e.assetId)}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors"
              >
                <span className="text-xs font-mono text-zinc-600 w-5">
                  {i + 1}
                </span>
                {e.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.logo}
                    alt=""
                    className="h-8 w-8 rounded-full bg-zinc-800"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-800" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    {label}
                  </div>
                  {e.symbol && (
                    <div className="text-[11px] text-zinc-500 font-mono uppercase">
                      {e.symbol}
                    </div>
                  )}
                </div>
                <span
                  className={`text-sm font-mono font-semibold ${
                    type === "hit" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {score}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
