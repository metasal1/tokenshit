"use client";

import { useEffect, useState } from "react";
import { CURATED_LISTS } from "@/lib/lists";
import { BalanceSkeleton } from "@/components/StatLoader";
import { EmojiIcon } from "@/components/EmojiIcon";

export default function StatsCategoryGrid() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(
      CURATED_LISTS.map(async (l) => {
        try {
          const r = await fetch(
            `/api/curated?list=${encodeURIComponent(l.key)}`
          );
          const d = await r.json();
          const n = Array.isArray(d.assets)
            ? d.assets.length
            : Array.isArray(d.items)
              ? d.items.length
              : typeof d.count === "number"
                ? d.count
                : 0;
          return [l.key, n] as const;
        } catch {
          return [l.key, 0] as const;
        }
      })
    ).then((pairs) => {
      if (!alive) return;
      const map: Record<string, number> = {};
      for (const [k, n] of pairs) map[k] = n;
      setCounts(map);
    });
    return () => {
      alive = false;
    };
  }, []);

  const total = counts
    ? Object.values(counts).reduce((a, b) => a + b, 0)
    : null;

  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <EmojiIcon size={18}>🗂️</EmojiIcon>
          <h2 className="text-sm font-bold font-orbitron uppercase tracking-wide text-zinc-200">
            Tokens by category
          </h2>
        </div>
        <span className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-600">
          Curated lists
        </span>
      </div>

      <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {CURATED_LISTS.map((c) => (
          <div
            key={c.key}
            className="rounded-xl border border-border bg-zinc-950/50 hover:border-zinc-600 transition-colors p-3 sm:p-3.5 flex items-center gap-2.5 min-h-[3.5rem]"
          >
            <EmojiIcon size={22}>{c.emoji}</EmojiIcon>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {c.label}
              </div>
              <div className="text-[11px] font-mono text-zinc-500 tabular-nums">
                {counts == null ? (
                  <BalanceSkeleton className="h-3 w-10" />
                ) : (
                  <>{(counts[c.key] ?? 0).toLocaleString()} tokens</>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="rounded-xl border border-neon/40 bg-neon/10 p-3 sm:p-3.5 flex items-center gap-2.5 min-h-[3.5rem] shadow-[0_0_20px_rgba(57,255,20,0.08)]">
          <EmojiIcon size={22}>🧮</EmojiIcon>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-semibold text-neon">
              Total
            </div>
            <div className="text-[11px] font-mono text-zinc-400 tabular-nums">
              {total == null ? (
                <BalanceSkeleton className="h-3 w-10" />
              ) : (
                <>{total.toLocaleString()} tokens</>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
