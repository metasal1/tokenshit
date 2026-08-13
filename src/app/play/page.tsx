import type { Metadata } from "next";
import DayGamePanel from "@/components/DayGamePanel";
import Link from "next/link";
import { PLAY_PRODUCT } from "@/lib/hour-product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${PLAY_PRODUCT.name} — TOKEN$HIT`,
  description: PLAY_PRODUCT.blurb,
  alternates: { canonical: PLAY_PRODUCT.path },
};

/**
 * Canonical play page — $SHIT OF THE DAY
 * Dense layout: fits desktop + mobile with minimal page scroll.
 */
export default function PlayPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 sm:px-4 pt-3 sm:pt-4 pb-4 lg:pb-6">
      {/* Compact brand header — one row on desktop */}
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 mb-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-monoton leading-none">
            <span className="neon-dollar">$</span>
            <span className="neon-text">SHIT</span>
            <span className="ml-2 align-middle text-[10px] sm:text-xs font-orbitron tracking-[0.18em] text-zinc-500 uppercase">
              of the day
            </span>
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-500 mt-1">
            {PLAY_PRODUCT.tagline}
          </p>
        </div>
        <nav className="flex items-center gap-3 text-[11px] text-zinc-600 shrink-0">
          <Link
            href={PLAY_PRODUCT.winnersPath}
            className="text-neon-blue hover:underline font-orbitron uppercase tracking-wider"
          >
            Winners
          </Link>
          <Link
            href={PLAY_PRODUCT.prevPath}
            className="text-neon-blue hover:underline font-orbitron uppercase tracking-wider"
          >
            Last
          </Link>
          <Link
            href="/"
            className="hover:text-zinc-400 font-orbitron uppercase tracking-wider"
          >
            Home
          </Link>
        </nav>
      </header>

      <DayGamePanel compactTitle dense />
    </div>
  );
}
