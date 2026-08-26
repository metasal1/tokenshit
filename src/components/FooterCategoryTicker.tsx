"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

type Item = { assetId: string; symbol: string; pct: number | null };
type Lane = { key: string; label: string; count: number; items: Item[] };

function fmtPct(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export default function FooterCategoryTicker() {
  const [lanes, setLanes] = useState<Lane[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/category-ticker", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (alive && Array.isArray(d.lanes)) setLanes(d.lanes);
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 120_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const chips: { key: string; node: ReactNode }[] = [];
  for (const lane of lanes || []) {
    chips.push({
      key: `h-${lane.key}`,
      node: (
        <span className="inline-flex items-center gap-1.5">
          <span className="text-neon font-orbitron uppercase tracking-wider text-[10px]">
            {lane.label}
          </span>
          <span className="text-white font-semibold">{lane.count || "—"}</span>
        </span>
      ),
    });
    for (const it of lane.items) {
      const up = it.pct != null && it.pct > 0;
      const down = it.pct != null && it.pct < 0;
      chips.push({
        key: `${lane.key}-${it.assetId}`,
        node: (
          <Link
            href={`/token/${encodeURIComponent(it.assetId)}`}
            className="inline-flex items-center gap-1.5 hover:text-neon transition-colors"
          >
            <span className="text-zinc-300">{it.symbol}</span>
            {it.pct != null ? (
              <span
                className={
                  up
                    ? "text-neon"
                    : down
                      ? "text-rose-400"
                      : "text-zinc-500"
                }
              >
                {fmtPct(it.pct)}
              </span>
            ) : null}
          </Link>
        ),
      });
    }
  }

  if (!chips.length) {
    return (
      <div
        className="relative w-full overflow-hidden border-t border-border/60 bg-zinc-950"
        style={{ height: 32 }}
        aria-hidden
      />
    );
  }

  const loop = [...chips, ...chips, ...chips];

  return (
    <div
      className="relative w-full overflow-hidden border-t border-border/60 bg-zinc-950"
      style={{ height: 32 }}
    >
      <div
        className="header-ticker-track absolute left-0 top-0 flex h-full items-center gap-0 whitespace-nowrap font-mono text-[11px] sm:text-xs text-zinc-300"
        aria-label="Stocks, majors, metals, and RWA ticker"
      >
        {loop.map((it, i) => (
          <span key={`${it.key}-${i}`} className="inline-flex items-center">
            <span className="px-3 sm:px-4">{it.node}</span>
            <span className="text-zinc-700 select-none" aria-hidden>
              ◆
            </span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
}
