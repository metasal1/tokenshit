"use client";

import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import { KOL_SCOUT_REWARD_SHIT, MIN_KOL_FOLLOWERS } from "@/lib/shit-token";

type Props = {
  /** compact strip vs full card */
  variant?: "strip" | "card";
  className?: string;
};

export default function ScoutPromoBanner({
  variant = "card",
  className = "",
}: Props) {
  const amount = KOL_SCOUT_REWARD_SHIT.toLocaleString();
  const min = MIN_KOL_FOLLOWERS.toLocaleString();

  if (variant === "strip") {
    return (
      <Link
        href="/kols"
        className={`group flex items-center gap-2 sm:gap-3 rounded-xl border border-neon/40 bg-gradient-to-r from-neon/15 via-neon/5 to-transparent px-3 py-2.5 sm:px-4 hover:border-neon hover:shadow-[0_0_28px_rgba(57,255,20,0.12)] transition-all active:scale-[0.99] ${className}`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neon/20 border border-neon/40">
          <EmojiIcon size={20}>🔍</EmojiIcon>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-white leading-tight">
            KOL Scout · earn{" "}
            <span className="text-neon font-mono">{amount}</span> $TOKENSHIT
          </p>
          <p className="text-[10px] sm:text-xs text-zinc-500 truncate">
            Nominate {min}+ CT voices → paid when accepted
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-neon px-2.5 py-1 text-[10px] font-orbitron font-bold uppercase tracking-wide text-black group-hover:brightness-110">
          Scout
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/kols"
      className={`block rounded-2xl border border-neon/45 bg-card overflow-hidden hover:border-neon hover:shadow-[0_0_40px_rgba(57,255,20,0.14)] transition-all active:scale-[0.995] ${className}`}
    >
      <div className="relative p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neon/12 via-transparent to-amber-500/5" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neon/40 bg-neon/15">
              <EmojiIcon size={28}>👑</EmojiIcon>
            </div>
            <div className="min-w-0">
              <p className="font-orbitron text-[10px] uppercase tracking-[0.2em] text-neon">
                Earn while you scroll CT
              </p>
              <h3 className="font-monoton text-2xl sm:text-3xl leading-none tracking-wide mt-1">
                <span className="neon-text">SCOUT</span>
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 leading-snug">
                Spot a {min}+ KOL → we accept → you get{" "}
                <span className="text-neon font-semibold font-mono">
                  {amount}
                </span>{" "}
                $TOKENSHIT
              </p>
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <span className="rounded-full border border-neon/50 bg-neon px-4 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(57,255,20,0.35)]">
              Nominate →
            </span>
            <span className="text-[10px] font-mono text-zinc-600">
              tokenshit.com/kols
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
