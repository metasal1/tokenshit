"use client";

import { useEffect, useState } from "react";
import { CURATED_LISTS } from "@/lib/lists";
import { BalanceSkeleton } from "@/components/StatLoader";

const EMOJI: Record<string, string> = {
  majors: "🪙",
  lsts: "🥩",
  currencies: "💵",
  rwas: "🏛️",
  stocks: "📈",
  metals: "🥇",
  etfs: "📦",
};

export default function StatsCategoryGrid() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(
      CURATED_LISTS.map(async (l) => {
        try {
          const r = await fetch(`/api/curated?list=${encodeURIComponent(l.key)}`);
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
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">Tokens by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {CURATED_LISTS.map((c) => (
          <div
            key={c.key}
            className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
          >
            <span className="text-2xl" aria-hidden>
              {EMOJI[c.key] || "•"}
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-foreground">{c.label}</div>
              <div className="text-sm font-mono text-zinc-400">
                {counts == null ? (
                  <BalanceSkeleton className="h-3.5 w-12" />
                ) : (
                  <>{counts[c.key] ?? 0} tokens</>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="rounded-xl border border-neon/30 bg-neon/5 p-4 flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            🧮
          </span>
          <div>
            <div className="font-semibold text-neon">Total</div>
            <div className="text-sm font-mono text-zinc-400">
              {total == null ? (
                <BalanceSkeleton className="h-3.5 w-12" />
              ) : (
                <>{total} tokens</>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
