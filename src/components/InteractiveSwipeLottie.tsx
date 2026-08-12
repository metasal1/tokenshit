"use client";

import LottiePlayer from "@/components/LottiePlayer";

/**
 * Interactive swipe Lottie — scrubs with drag, bursts on commit.
 * Not a static decoration sitting on the page.
 */
export default function InteractiveSwipeLottie({
  offsetX = 0,
  threshold = 100,
  burst = null,
  burstKey = 0,
  size = 96,
  className = "",
  variant = "hand",
  /** vote: right drag = HIT (left edge). nav: right drag = prev (left edge) */
  mode = "nav",
}: {
  offsetX?: number;
  threshold?: number;
  burst?: "left" | "right" | "hit" | "shit" | null;
  burstKey?: number | string;
  size?: number;
  className?: string;
  variant?: "hand" | "phone";
  mode?: "nav" | "vote";
}) {
  const dragging = Math.abs(offsetX) > 8 && !burst;
  const progress = dragging
    ? Math.min(1, Math.abs(offsetX) / Math.max(40, threshold))
    : null;

  // Which edge to show the Lottie on
  let placeRight = false;
  let flip = false;
  let tint: "neon" | "red" | "zinc" = "zinc";

  if (burst === "left" || burst === "shit" || (!burst && offsetX < -8)) {
    // swipe left → card exits left → lottie on right edge
    placeRight = true;
    flip = true;
    tint = mode === "vote" ? "red" : "neon";
  } else if (burst === "right" || burst === "hit" || (!burst && offsetX > 8)) {
    // swipe right → lottie on left edge
    placeRight = false;
    flip = false;
    tint = mode === "vote" ? "neon" : "zinc";
  } else if (!burst) {
    return null;
  }

  const src =
    variant === "phone" ? "/lottie/swipe-phone.json" : "/lottie/swipe-hand.json";

  const opacity = burst ? 1 : 0.25 + 0.75 * (progress || 0);
  if (opacity < 0.08 && !burst) return null;

  const glow =
    tint === "neon"
      ? "drop-shadow(0 0 14px rgba(57,255,20,0.75))"
      : tint === "red"
        ? "drop-shadow(0 0 14px rgba(248,113,113,0.75))"
        : "drop-shadow(0 0 10px rgba(161,161,170,0.45))";

  return (
    <div
      className={`pointer-events-none absolute inset-y-0 z-30 flex items-center ${
        placeRight ? "right-0 sm:right-2" : "left-0 sm:left-2"
      } ${className}`}
      aria-hidden
      style={{ opacity }}
    >
      <div
        style={{
          width: size,
          height: size,
          transform: flip ? "scaleX(-1)" : undefined,
          filter: burst || (progress || 0) > 0.4 ? glow : undefined,
        }}
      >
        <LottiePlayer
          src={src}
          className="h-full w-full"
          loop={false}
          autoplay={Boolean(burst)}
          progress={burst ? null : progress}
          playKey={burst ? String(burstKey) : "0"}
        />
      </div>
    </div>
  );
}

/** Edge glow while dragging */
export function SwipeEdgeGlow({
  side,
  intensity,
  mode = "nav",
}: {
  side: "left" | "right";
  intensity: number;
  mode?: "nav" | "vote";
}) {
  if (intensity <= 0.02) return null;
  const isLeft = side === "left";
  const color =
    mode === "vote"
      ? isLeft
        ? "from-neon/50 via-neon/15"
        : "from-red-500/50 via-red-500/15"
      : isLeft
        ? "from-zinc-300/25 via-zinc-400/8"
        : "from-neon/40 via-neon/12";
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 z-20 w-24 sm:w-32 ${
        isLeft ? "left-0" : "right-0"
      }`}
      style={{
        opacity: Math.min(1, intensity),
        background: isLeft
          ? `linear-gradient(to right, ${
              mode === "vote"
                ? "rgba(57,255,20,0.35)"
                : "rgba(161,161,170,0.22)"
            }, transparent)`
          : `linear-gradient(to left, ${
              mode === "vote"
                ? "rgba(239,68,68,0.4)"
                : "rgba(57,255,20,0.28)"
            }, transparent)`,
      }}
      aria-hidden
    />
  );
}
