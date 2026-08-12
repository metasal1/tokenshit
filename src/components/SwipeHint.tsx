"use client";

import { useEffect, useState } from "react";
import LottiePlayer from "@/components/LottiePlayer";

const SEEN_KEY = "tokenshit_swipe_hint_seen_v2";

/**
 * Lottie swipe coach-mark (LottieFiles free swipe pack).
 * Vote: swipe right = HIT · left = SHIT
 * Nav: swipe to browse cases
 */
export default function SwipeHint({
  mode = "nav",
  className = "",
  force = false,
}: {
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
      }, 5200);
      return () => clearTimeout(t);
    } catch {
      setShow(true);
    }
  }, [force]);

  if (!show) return null;

  // VoteButtons: right = HIT, left = SHIT
  const leftLabel = mode === "vote" ? "SHIT" : "prev";
  const rightLabel = mode === "vote" ? "HIT" : "next";
  const leftColor = mode === "vote" ? "text-red-400" : "text-zinc-400";
  const rightColor = mode === "vote" ? "text-neon" : "text-zinc-400";

  return (
    <div
      className={`pointer-events-none select-none flex flex-col items-center gap-1.5 ${className}`}
      aria-hidden
    >
      <div className="relative flex items-center justify-center gap-2 sm:gap-4">
        <span
          className={`text-[10px] font-mono uppercase tracking-wider ${leftColor} w-10 text-right`}
        >
          {leftLabel}
        </span>
        <div className="relative h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]">
          <LottiePlayer
            src="/lottie/swipe-hand.json"
            className="h-full w-full"
            loop
            autoplay
          />
        </div>
        <span
          className={`text-[10px] font-mono uppercase tracking-wider ${rightColor} w-10 text-left`}
        >
          {rightLabel}
        </span>
      </div>
      <p className="text-[10px] text-zinc-500 font-mono tracking-wide">
        {mode === "vote" ? "swipe to vote" : "swipe for next case"}
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
  intensity: number;
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
