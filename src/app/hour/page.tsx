import type { Metadata } from "next";
import DayGamePanel from "@/components/DayGamePanel";
import Link from "next/link";
import { HOUR_PRODUCT } from "@/lib/hour-product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${HOUR_PRODUCT.name} — TOKEN$HIT`,
  description: HOUR_PRODUCT.blurb,
  alternates: { canonical: HOUR_PRODUCT.path },
};

/**
 * Canonical page for THE HOUR (hourly HIT/SHIT stakes).
 */
export default function HourPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-4 pt-6 pb-12 space-y-4">
      <div className="text-center space-y-2 mb-2">
        <p className="text-[10px] font-orbitron uppercase tracking-[0.25em] text-neon">
          Main game
        </p>
        <h1 className="text-3xl sm:text-4xl font-monoton leading-none">
          <span className="neon-text">THE</span>{" "}
          <span className="neon-dollar">HOUR</span>
        </h1>
        <p className="text-sm text-zinc-400">{HOUR_PRODUCT.tagline}</p>
      </div>

      <DayGamePanel compactTitle />

      <p className="text-center text-[11px] text-zinc-600 space-x-2">
        <Link href={HOUR_PRODUCT.winnersPath} className="text-neon-blue hover:underline">
          Winners
        </Link>
        <span>·</span>
        <Link href={HOUR_PRODUCT.prevPath} className="text-neon-blue hover:underline">
          Last hour
        </Link>
        <span>·</span>
        <Link href="/" className="hover:text-zinc-400">
          Home
        </Link>
      </p>
    </div>
  );
}
