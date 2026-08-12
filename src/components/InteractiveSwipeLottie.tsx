"use client";

/**
 * Edge glow while dragging — no Lottie.
 */
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
                ? "rgba(57,255,20,0.4)"
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

/** @deprecated no-op — Lottie removed */
export default function InteractiveSwipeLottie(_props: {
  offsetX?: number;
  threshold?: number;
  burst?: string | null;
  burstKey?: number | string;
  size?: number;
  className?: string;
  variant?: string;
  mode?: string;
}) {
  return null;
}
