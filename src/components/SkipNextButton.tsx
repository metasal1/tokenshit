"use client";

/**
 * Skip / next bag — plain control, no Lottie.
 */
export default function SkipNextButton({
  onClick,
  disabled,
  label = "Next bag",
  sublabel = "tap",
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
        className={`group inline-flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-200 disabled:opacity-40 transition-colors ${className}`}
      >
        <span className="underline-offset-2 group-hover:underline font-medium">
          {label}
        </span>
        <span className="font-mono text-zinc-600 group-hover:text-neon" aria-hidden>
          →
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
        className={`group inline-flex items-center gap-1.5 text-xs pl-3 pr-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-neon/50 hover:bg-zinc-900/80 transition-colors disabled:opacity-40 active:scale-95 ${className}`}
        title={sublabel}
      >
        <span className="font-semibold">{label}</span>
        <span className="font-mono text-neon/80" aria-hidden>
          →
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group w-full min-h-11 rounded-xl border border-zinc-700/80 bg-zinc-950/60 hover:border-neon/40 hover:bg-zinc-900/80 disabled:opacity-40 transition-colors flex items-center justify-center gap-3 px-4 py-2.5 active:scale-[0.99] ${className}`}
    >
      <span className="text-left flex-1">
        <span className="block text-sm font-bold text-zinc-100 group-hover:text-white">
          {label}
        </span>
        <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          {sublabel}
        </span>
      </span>
      <span
        className="text-xl font-mono text-neon group-hover:translate-x-0.5 transition-transform"
        aria-hidden
      >
        →
      </span>
    </button>
  );
}
