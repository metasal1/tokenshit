"use client";

/**
 * Optional swipe coach — text only (Lottie removed).
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
  if (!force) return null;
  return (
    <p
      className={`text-[10px] font-mono uppercase tracking-wider text-zinc-500 text-center ${className}`}
      aria-hidden
    >
      {mode === "vote" ? "swipe to vote" : "swipe for next bag"}
    </p>
  );
}

export { SwipeEdgeGlow } from "@/components/InteractiveSwipeLottie";
