"use client";

import LottiePlayer from "@/components/LottiePlayer";

/**
 * Skip / next-case control with Lottie swipe affordance.
 * No default emoji chrome.
 */
export default function SkipNextButton({
  onClick,
  disabled,
  label = "Next case",
  sublabel = "swipe or tap",
  className = "",
  variant = "button",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
  variant?: "button" | "link" | "chip";
}) {
  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`group inline-flex items-center justify-center gap-2 text-[11px] text-zinc-500 hover:text-zinc-200 disabled:opacity-40 transition-colors ${className}`}
      >
        <span className="h-7 w-7 opacity-80 group-hover:opacity-100">
          <LottiePlayer
            src="/lottie/swipe-hand.json"
            className="h-full w-full"
            loop
            autoplay
            ariaLabel="Swipe"
          />
        </span>
        <span className="underline-offset-2 group-hover:underline font-medium">
          {label}
        </span>
      </button>
    );
  }

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`group inline-flex items-center gap-1.5 text-xs pl-2 pr-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-neon/50 hover:bg-zinc-900/80 transition-colors disabled:opacity-40 ${className}`}
        title={sublabel}
      >
        <span className="h-6 w-6 shrink-0">
          <LottiePlayer
            src="/lottie/swipe-hand.json"
            className="h-full w-full"
            loop
            autoplay
          />
        </span>
        <span className="font-semibold">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group w-full min-h-11 rounded-xl border border-zinc-700/80 bg-zinc-950/60 hover:border-neon/40 hover:bg-zinc-900/80 disabled:opacity-40 transition-colors flex items-center justify-center gap-3 px-4 py-2.5 ${className}`}
    >
      <span className="h-10 w-10 shrink-0 opacity-90 group-hover:opacity-100">
        <LottiePlayer
          src="/lottie/swipe-phone.json"
          className="h-full w-full"
          loop
          autoplay
          ariaLabel="Swipe to next"
        />
      </span>
      <span className="text-left">
        <span className="block text-sm font-bold text-zinc-100 group-hover:text-white">
          {label}
        </span>
        <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          {sublabel}
        </span>
      </span>
    </button>
  );
}
