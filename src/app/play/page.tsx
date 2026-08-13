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
 */
export default function PlayPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-4 pt-6 pb-12 space-y-4">
      <div className="text-center space-y-2 mb-2">
        <p className="text-[10px] font-orbitron uppercase tracking-[0.25em] text-neon">
          Main game
        </p>
        <h1 className="text-2xl sm:text-4xl font-monoton leading-none">
          <span className="neon-dollar">$</span>
          <span className="neon-text">SHIT</span>
          <span className="text-zinc-500 font-orbitron text-sm sm:text-base block mt-2 tracking-[0.2em] uppercase">
            of the day
          </span>
        </h1>
        <p className="text-sm text-zinc-400">{PLAY_PRODUCT.tagline}</p>
      </div>

      <DayGamePanel compactTitle />

      <p className="text-center text-[11px] text-zinc-600 space-x-2">
        <Link
          href={PLAY_PRODUCT.winnersPath}
          className="text-neon-blue hover:underline"
        >
          Winners
        </Link>
        <span>·</span>
        <Link
          href={PLAY_PRODUCT.prevPath}
          className="text-neon-blue hover:underline"
        >
          Last round
        </Link>
        <span>·</span>
        <Link href="/" className="hover:text-zinc-400">
          Home
        </Link>
      </p>
    </div>
  );
}
