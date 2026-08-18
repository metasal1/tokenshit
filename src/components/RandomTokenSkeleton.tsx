"use client";

import { useEffect, useState } from "react";
import { EmojiIcon } from "@/components/EmojiIcon";

/** Rotating shitpost lines while the next bag loads */
export const LOAD_TICKER_LINES = [
  "Sniffing the blockchain…",
  "Asking the bag holders…",
  "Checking for rugs…",
  "Consulting the chart astrologer…",
  "Polling exit liquidity…",
  "Rolling the degen dice…",
  "Decrypting alpha leaks…",
  "Asking your favorite KOL…",
  "Backtesting vibes…",
  "Counting the chads…",
  "Every bag is shit until proven otherwise…",
  "Warming up the HIT cannon…",
  "Shaking the SHIT tree…",
  "Finding a bag worth roasting…",
  "Loading next unserious asset…",
  "Scanning Tokens.xyz for chaos…",
  "Don't ape yet — still loading…",
  "Vibes.sol compiling…",
  "Ser, one more bag…",
  "NGMI until the next card drops…",
];

/** Compact / marquee ticker while next vote loads */
export function FunLoadTicker({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(Math.floor(Math.random() * LOAD_TICKER_LINES.length));
    const id = window.setInterval(() => {
      setIdx(
        (i) =>
          (i + 1 + Math.floor(Math.random() * (LOAD_TICKER_LINES.length - 1))) %
          LOAD_TICKER_LINES.length
      );
    }, 900);
    return () => window.clearInterval(id);
  }, []);

  const strip = [...LOAD_TICKER_LINES, ...LOAD_TICKER_LINES];

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 overflow-hidden rounded-lg border border-neon/25 bg-zinc-950/90 px-3 py-2 ${className}`}
        role="status"
        aria-live="polite"
      >
        <span className="shrink-0 animate-spin text-neon" aria-hidden>
          <EmojiIcon size={16}>💫</EmojiIcon>
        </span>
        <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-300 transition-opacity">
          {LOAD_TICKER_LINES[idx]}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-neon/20 bg-black/50 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="fun-load-ticker-track flex w-max gap-10 whitespace-nowrap py-2 pl-4 font-mono text-[11px] uppercase tracking-wide text-neon/90">
        {strip.map((line, i) => (
          <span
            key={`${i}-${line.slice(0, 12)}`}
            className="inline-flex items-center gap-2"
          >
            <EmojiIcon size={12}>💫</EmojiIcon>
            {line}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes fun-load-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        :global(.fun-load-ticker-track) {
          animation: fun-load-marquee 28s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.fun-load-ticker-track) {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default function RandomTokenSkeleton() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    setMsgIdx(Math.floor(Math.random() * LOAD_TICKER_LINES.length));
    const id = window.setInterval(
      () =>
        setMsgIdx(
          (i) =>
            (i +
              1 +
              Math.floor(Math.random() * (LOAD_TICKER_LINES.length - 1))) %
            LOAD_TICKER_LINES.length
        ),
      1100
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <FunLoadTicker />
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 space-y-1.5">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-2.5 w-12 rounded" />
          </div>
        </div>
        <div className="skeleton h-7 w-16 shrink-0 rounded-md" />
      </div>

      <div className="space-y-4 p-4">
        <div className="text-center">
          <div className="inline-flex items-baseline gap-0 font-monoton text-2xl sm:text-3xl">
            <span className="neon-text loading-pulse">TOKEN</span>
            <span className="neon-dollar">$</span>
            <span className="neon-text loading-pulse">HIT</span>
          </div>
          <p className="mt-3 min-h-[1.25rem] font-mono text-xs text-zinc-500 transition-opacity">
            {LOAD_TICKER_LINES[msgIdx]}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="loading-rise flex min-h-[100px] flex-1 flex-col items-center justify-center gap-2 rounded-xl border-[3px] border-green-900/60 bg-green-950/40">
            <EmojiIcon size={36} className="opacity-70">
              🎯
            </EmojiIcon>
            <div className="skeleton h-2.5 w-10 rounded" />
          </div>
          <div
            className="loading-rise flex min-h-[100px] flex-1 flex-col items-center justify-center gap-2 rounded-xl border-[3px] border-red-900/60 bg-red-950/40"
            style={{ animationDelay: "0.15s" }}
          >
            <EmojiIcon size={36} className="opacity-70">
              💀
            </EmojiIcon>
            <div className="skeleton h-2.5 w-10 rounded" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        :global(.loading-pulse) {
          animation: loading-pulse 1.4s ease-in-out infinite;
        }
        @keyframes loading-rise {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        :global(.loading-rise) {
          animation: loading-rise 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
