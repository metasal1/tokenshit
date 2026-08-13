"use client";

import { EmojiIcon } from "@/components/EmojiIcon";

/** Neon pulse spinner / skeleton for live stats */
export function PulseDot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full bg-neon/80 animate-pulse shadow-[0_0_6px_#39ff14] ${className}`}
      aria-hidden
    />
  );
}

export function InlineLoader({
  label = "Loading",
  className = "",
  width = "3.5rem",
}: {
  label?: string;
  className?: string;
  width?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 align-middle ${className}`}
      role="status"
      aria-label={label}
    >
      <span
        className="inline-block h-3 rounded bg-zinc-700/80 animate-pulse"
        style={{ width }}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Compact loading spinner — Noto Color Emoji via EmojiIcon (loading only). */
export function SpinLoader({
  size = 16,
  className = "",
  label = "Loading",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      <EmojiIcon size={size} className="animate-spin opacity-90" label={label}>
        💫
      </EmojiIcon>
    </span>
  );
}

/** Skeleton bar for balances */
export function BalanceSkeleton({
  className = "",
  wide = false,
}: {
  className?: string;
  wide?: boolean;
}) {
  return (
    <span
      className={`inline-block h-4 rounded bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse ${
        wide ? "w-24" : "w-14"
      } ${className}`}
      aria-hidden
    />
  );
}
