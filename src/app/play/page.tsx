import type { Metadata } from "next";
import DayGamePanel from "@/components/DayGamePanel";
import Link from "next/link";
import { PLAY_PRODUCT } from "@/lib/hour-product";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: PLAY_PRODUCT.name,
  description: PLAY_PRODUCT.blurb,
  path: PLAY_PRODUCT.path,
});

/**
 * Canonical play page — $HIT OF THE DAY
 * Fills viewport; DayGamePanel dock handles play without page scroll.
 */
export default function PlayPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-3 pt-2 sm:pt-3 flex flex-col min-h-0 h-[calc(100dvh-env(safe-area-inset-top)-3.25rem)]">
      <header className="flex items-center justify-between gap-2 shrink-0 mb-2">
        <h1 className="text-lg sm:text-xl font-monoton leading-none truncate">
          <span className="neon-dollar">$</span>
          <span className="neon-text">HIT</span>
          <span className="ml-1.5 align-middle text-[9px] font-orbitron tracking-[0.16em] text-zinc-500 uppercase">
            of the day
          </span>
        </h1>
        <nav className="flex items-center gap-2.5 text-[10px] text-zinc-600 shrink-0 font-orbitron uppercase tracking-wider">
          <Link
            href={PLAY_PRODUCT.winnersPath}
            className="text-neon-blue hover:underline"
          >
            Winners
          </Link>
          <Link href="/" className="hover:text-zinc-400">
            Home
          </Link>
        </nav>
      </header>

      <div className="flex-1 min-h-0">
        <DayGamePanel compactTitle dense />
      </div>
    </div>
  );
}
