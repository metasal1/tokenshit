"use client";

import { useEffect, useState } from "react";
import LottiePlayer from "@/components/LottiePlayer";

const SEEN_KEY = "tokenshit_swipe_hint_seen_v1";

/**
 * Lottie swipe coach-mark (LottieFiles free swipe pack).
 * https://lottiefiles.com/free-animations/swipe
 */
export default function SwipeHint({
  mode = "nav",
  className = "",
  force = false,
}: {
  /** nav = browse tokens · vote = HIT/SHIT swipe */
  mode?: "nav" | "vote";
  className?: string;
  force?: boolean;
}) {
  const [show, setShow] = useState(force);

  useEffect(() => {
    if (force) {
      setShow(true);
      return;
    }
    try {
      if (localStorage.getItem(SEEN_KEY) === "1") {
        setShow(false);
        return;
      }
      setShow(true);
      const t = window.setTimeout(() => {
        localStorage.setItem(SEEN_KEY, "1");
        setShow(false);
      }, 4500);
      return () => clearTimeout(t);
    } catch {
      setShow(true);
    }
  }, [force]);

  if (!show) return null;

  const leftLabel = mode === "vote" ? "HIT" : "prev";
  const rightLabel = mode === "vote" ? "SHIT" : "next";
  const leftColor = mode === "vote" ? "text-neon" : "text-zinc-400";
  const rightColor = mode === "vote" ? "text-red-400" : "text-zinc-400";

  return (
    <div
      className={`pointer-events-none select-none flex flex-col items-center gap-1 ${className}`}
      aria-hidden
    >
      <div className="relative flex items-center justify-center gap-3">
        <span
          className={`text-[10px] font-mono uppercase tracking-wider ${leftColor}`}
        >
          ← {leftLabel}
        </span>
        <div className="relative h-14 w-14 sm:h-16 sm:w-16">
          {/* main hand swipe */}
          <LottiePlayer
            src="/lottie/swipe-hand.json"
            className="h-full w-full"
            loop
            autoplay
          />
        </div>
        <span
          className={`text-[10px] font-mono uppercase tracking-wider ${rightColor}`}
        >
          {rightLabel} →
        </span>
      </div>
      <p className="text-[10px] text-zinc-600 font-mono">
        {mode === "vote" ? "swipe to vote" : "swipe to browse"}
      </p>
    </div>
  );
}

/** Compact edge glow while user is mid-swipe */
export function SwipeEdgeGlow({
  side,
  intensity,
}: {
  side: "left" | "right";
  intensity: number; // 0–1
}) {
  if (intensity <= 0.02) return null;
  const isLeft = side === "left";
  const color = isLeft
    ? "from-neon/40 via-neon/10"
    : "from-red-500/40 via-red-500/10";
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${
        isLeft ? "left-0" : "right-0"
      } w-16 bg-gradient-to-${isLeft ? "r" : "l"} ${color} to-transparent z-20`}
      style={{ opacity: Math.min(1, intensity) }}
      aria-hidden
    />
  );
}
