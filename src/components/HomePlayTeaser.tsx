"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PLAY_PRODUCT } from "@/lib/hour-product";
import { SHIT_SYMBOL } from "@/lib/shit-token";
import { EmojiIcon } from "@/components/EmojiIcon";

type DayLite = {
  nextCloseAt?: string;
  round?: { hitPot?: number; shitPot?: number } | null;
  stats?: { hitTickets?: number; shitTickets?: number };
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtCd(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((x) => String(x).padStart(2, "0")).join(":");
}

/**
 * Home Play teaser — no full DayGamePanel embed (too heavy).
 * Pots + countdown + one CTA → /play
 */
export default function HomePlayTeaser() {
  const [data, setData] = useState<DayLite | null>(null);
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const load = () => {
      fetch("/api/day", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setData(d))
        .catch(() => {});
    };
    load();
    const a = setInterval(load, 25_000);
    const b = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);

  const cd = useMemo(() => {
    if (!mounted || !data?.nextCloseAt) return "—:—:—";
    return fmtCd(Date.parse(data.nextCloseAt) - Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.nextCloseAt, tick, mounted]);

  const hit = data?.round?.hitPot ?? 0;
  const shit = data?.round?.shitPot ?? 0;

  return (
    <section className="rounded-2xl border border-neon/40 bg-gradient-to-b from-neon/10 via-card to-card overflow-hidden">
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-orbitron uppercase tracking-[0.22em] text-neon">
              Main game
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-monoton leading-none">
              <span className="neon-dollar">$</span>
              <span className="neon-text">SHIT</span>
            </h2>
            <p className="mt-1 text-[11px] sm:text-xs font-orbitron uppercase tracking-[0.16em] text-zinc-500">
              of the day
            </p>
            <p className="mt-2 text-sm text-zinc-400 max-w-xs">
              {PLAY_PRODUCT.tagline} · 1,000 ${SHIT_SYMBOL} · hourly UTC
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] font-orbitron uppercase tracking-wider text-zinc-500">
              Closes
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-neon tabular-nums">
              {cd}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-green-500/25 bg-green-950/25 px-3 py-2.5 text-left">
            <div className="text-[10px] font-orbitron uppercase tracking-wider text-green-400/90 flex items-center gap-1">
              <EmojiIcon size={12}>🎯</EmojiIcon> Hit pot
            </div>
            <div className="text-xl font-mono font-bold text-green-400 tabular-nums mt-0.5">
              {fmt(hit)}
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">
              {data?.stats?.hitTickets ?? 0} in
            </div>
          </div>
          <div className="rounded-xl border border-red-500/25 bg-red-950/25 px-3 py-2.5 text-right">
            <div className="text-[10px] font-orbitron uppercase tracking-wider text-red-400/90 flex items-center justify-end gap-1">
              Shit pot <EmojiIcon size={12}>💀</EmojiIcon>
            </div>
            <div className="text-xl font-mono font-bold text-red-400 tabular-nums mt-0.5">
              {fmt(shit)}
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">
              {data?.stats?.shitTickets ?? 0} in
            </div>
          </div>
        </div>

        <Link
          href={PLAY_PRODUCT.path}
          className="flex w-full min-h-12 items-center justify-center rounded-xl bg-neon text-black text-base font-bold font-orbitron tracking-wide uppercase hover:brightness-110 active:scale-[0.99] transition"
        >
          Play now
        </Link>
      </div>
    </section>
  );
}
