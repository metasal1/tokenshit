"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { assetId: string; symbol: string; pct: number | null };
type Lane = { key: string; label: string; count: number; items: Item[] };

const STORE = "tokenshit_footer_tickers";
const ROW = 26;

function fmtPct(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function LaneTape({
  lane,
  speedClass,
}: {
  lane: Lane;
  speedClass: string;
}) {
  const chips = lane.items.map((it) => {
    const up = it.pct != null && it.pct > 0;
    const down = it.pct != null && it.pct < 0;
    return (
      <Link
        key={it.assetId}
        href={`/token/${encodeURIComponent(it.assetId)}`}
        className="inline-flex items-center gap-1 hover:text-neon transition-colors px-2.5"
      >
        <span className="text-zinc-300">{it.symbol}</span>
        {it.pct != null ? (
          <span
            className={
              up ? "text-neon" : down ? "text-rose-400" : "text-zinc-500"
            }
          >
            {fmtPct(it.pct)}
          </span>
        ) : null}
      </Link>
    );
  });
  const loop = chips.length ? [...chips, ...chips, ...chips] : chips;

  return (
    <div
      className="flex h-[26px] items-center border-t border-border/50 bg-zinc-950/95 backdrop-blur"
      style={{ height: ROW }}
    >
      <span className="shrink-0 z-10 flex items-center gap-1.5 px-2 sm:px-2.5 border-r border-border/60 bg-zinc-950 min-w-[5.5rem]">
        <span className="text-neon font-orbitron uppercase tracking-wider text-[9px] sm:text-[10px]">
          {lane.label}
        </span>
        <span className="text-white font-semibold font-mono text-[10px]">
          {lane.count || "—"}
        </span>
      </span>
      <div className="relative min-w-0 flex-1 overflow-hidden h-full">
        <div
          className={`${speedClass} absolute left-0 top-0 flex h-full items-center whitespace-nowrap font-mono text-[10px] sm:text-[11px] text-zinc-300`}
        >
          {loop.length ? (
            loop.map((node, i) => (
              <span key={i} className="inline-flex items-center">
                {node}
                <span className="text-zinc-700 select-none" aria-hidden>
                  ◆
                </span>
              </span>
            ))
          ) : (
            <span className="px-3 text-zinc-600">—</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FooterCategoryTicker() {
  const [lanes, setLanes] = useState<Lane[] | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORE);
      if (v === "0") setOpen(false);
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    const h = open ? ROW * 4 : ROW;
    document.documentElement.style.setProperty("--footer-ticker-h", `${h}px`);
    return () => {
      document.documentElement.style.removeProperty("--footer-ticker-h");
    };
  }, [open]);

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

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORE, next ? "1" : "0");
      } catch {
        /* */
      }
      return next;
    });
  };

  const list = lanes || [];

  return (
    <div
      className="fixed inset-x-0 z-40 pointer-events-auto bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:bottom-0"
      role="region"
      aria-label="Category tickers"
    >
      <button
        type="button"
        onClick={toggle}
        className="absolute -top-6 right-2 z-20 min-h-6 px-2 rounded-t-md border border-b-0 border-border/70 bg-zinc-950/95 text-[9px] font-orbitron uppercase tracking-wider text-zinc-400 hover:text-neon"
        aria-expanded={open}
      >
        {open ? "Hide" : "Tickers"}
      </button>

      {open ? (
        <div className="border-t border-border/70 shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
          {list.map((lane, i) => (
            <LaneTape
              key={lane.key}
              lane={lane}
              speedClass={`footer-ticker-track footer-ticker-track-${i + 1}`}
            />
          ))}
          {!list.length ? (
            <div
              className="border-t border-border/50 bg-zinc-950"
              style={{ height: ROW * 4 }}
              aria-hidden
            />
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={toggle}
          className="flex h-[26px] w-full items-center justify-between gap-2 border-t border-border/70 bg-zinc-950/95 px-3 font-mono text-[10px] text-zinc-400 hover:text-zinc-200"
        >
          <span className="truncate">
            {(list.length ? list : [
              { label: "Stocks", count: 0 },
              { label: "Majors", count: 0 },
              { label: "Metals", count: 0 },
              { label: "RWA", count: 0 },
            ]).map((l, i) => (
              <span key={l.label}>
                {i ? " · " : ""}
                <span className="text-neon">{l.label}</span>{" "}
                {l.count || "—"}
              </span>
            ))}
          </span>
          <span className="font-orbitron uppercase tracking-wider text-[9px] text-zinc-500 shrink-0">
            Show
          </span>
        </button>
      )}
    </div>
  );
}
