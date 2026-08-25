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
  if (ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return [h, mm, sec].map((x) => String(x).padStart(2, "0")).join(":");
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * Home Play teaser — pot + countdown + one CTA → /play
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

  const msLeft = useMemo(() => {
    if (!mounted || !data?.nextCloseAt) return null;
    return Date.parse(data.nextCloseAt) - Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.nextCloseAt, tick, mounted]);

  const cd = msLeft == null ? "—:— " : fmtCd(msLeft);
  const urgent = msLeft != null && msLeft > 0 && msLeft < 5 * 60_000;

  const hit = data?.round?.hitPot ?? 0;
  const shit = data?.round?.shitPot ?? 0;
  const total = hit + shit;
  const hitT = data?.stats?.hitTickets ?? 0;
  const shitT = data?.stats?.shitTickets ?? 0;

  return (
    <section className="rounded-2xl border-2 border-neon/50 bg-gradient-to-b from-neon/15 via-card to-card overflow-hidden h-full flex flex-col shadow-[0_0_40px_rgba(57,255,20,0.12)]">
      <div className="p-4 sm:p-5 md:p-5 lg:p-6 space-y-3.5 md:space-y-4 lg:space-y-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-orbitron uppercase tracking-[0.22em] text-neon">
              Main game · this hour
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl md:text-[1.85rem] lg:text-4xl font-monoton leading-none">
              <span className="neon-dollar">$</span>
              <span className="neon-text">HIT</span>
            </h2>
            <p className="mt-1 text-[11px] sm:text-xs font-orbitron uppercase tracking-[0.16em] text-zinc-500">
              of the day
            </p>
            <p className="mt-2 text-sm text-zinc-300 max-w-sm md:max-w-[16rem] lg:max-w-sm leading-snug">
              <span className="text-neon font-semibold">FREE</span> · hold 10k ·
              1 UP + 1 DOWN ·{" "}
              <span className="text-green-400 font-semibold">HIT</span> or{" "}
              <span className="text-red-400 font-semibold">SHIT</span> · 10k $
              {SHIT_SYMBOL}/hr (+ jackpot)
            </p>
          </div>
          <div
            className={`text-right shrink-0 rounded-xl border px-2.5 py-2 ${
              urgent
                ? "border-amber-400/50 bg-amber-500/10"
                : "border-neon/30 bg-black/30"
            }`}
          >
            <div className="text-[9px] font-orbitron uppercase tracking-wider text-zinc-500">
              {urgent ? "Closing soon" : "Closes in"}
            </div>
            <div
              className={`text-xl sm:text-2xl md:text-2xl lg:text-3xl font-mono font-bold tabular-nums ${
                urgent ? "text-amber-300" : "text-neon"
              }`}
            >
              {cd}
            </div>
          </div>
        </div>

        {/* Total pot hero */}
        <div className="rounded-xl border border-neon/35 bg-black/40 px-3 py-3 text-center">
          <div className="text-[10px] font-orbitron uppercase tracking-[0.18em] text-zinc-500">
            Live pot
          </div>
          <div className="mt-0.5 text-3xl sm:text-4xl font-mono font-black text-neon tabular-nums">
            {fmt(total)}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            ${SHIT_SYMBOL} · {hitT + shitT} tickets in
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-2.5 lg:gap-3 content-start">
          <div className="rounded-xl border border-green-500/25 bg-green-950/25 px-3 py-2.5 text-left">
            <div className="text-[10px] font-orbitron uppercase tracking-wider text-green-400/90 flex items-center gap-1">
              <EmojiIcon size={12}>🎯</EmojiIcon> Hit pot
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-green-400 tabular-nums mt-0.5">
              {fmt(hit)}
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">{hitT} in</div>
          </div>
          <div className="rounded-xl border border-red-500/25 bg-red-950/25 px-3 py-2.5 text-right">
            <div className="text-[10px] font-orbitron uppercase tracking-wider text-red-400/90 flex items-center justify-end gap-1">
              Shit pot <EmojiIcon size={12}>💀</EmojiIcon>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-red-400 tabular-nums mt-0.5">
              {fmt(shit)}
            </div>
            <div className="text-[10px] text-zinc-600 font-mono">{shitT} in</div>
          </div>
        </div>

        <a
          href="/brand/play-poster.png"
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-xl border border-neon/25 bg-black/30"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/play-poster.png"
            alt="Free Play poster"
            className="aspect-square w-full object-cover max-h-40 sm:max-h-48 object-top"
          />
        </a>
        <Link
          href={PLAY_PRODUCT.path}
          className="mt-auto flex w-full min-h-14 sm:min-h-14 items-center justify-center gap-2 rounded-xl bg-neon text-black text-base sm:text-lg font-bold font-orbitron tracking-wide uppercase hover:brightness-110 active:scale-[0.99] transition shadow-[0_0_32px_rgba(57,255,20,0.35)]"
        >
          <EmojiIcon size={20}>🎯</EmojiIcon>
          Play this hour
        </Link>
        <p className="text-center text-[10px] text-zinc-600 -mt-1">
          <Link href="/posters" className="text-zinc-500 hover:text-neon">
            Posters
          </Link>
          {" · "}
          Not in this hour yet? You&apos;re missing the split.
        </p>
      </div>
    </section>
  );
}
