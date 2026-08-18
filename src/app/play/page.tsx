import type { Metadata } from "next";
import DayGamePanel from "@/components/DayGamePanel";
import { PLAY_PRODUCT } from "@/lib/hour-product";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: PLAY_PRODUCT.name,
  description: PLAY_PRODUCT.blurb,
  path: PLAY_PRODUCT.path,
});

/**
 * Full-bleed mobile game surface — minimal chrome, max play area.
 */
export default function PlayPage() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-env(safe-area-inset-top)-3.5rem-4.25rem)] w-full max-w-lg flex-col px-2.5 pt-1.5 md:h-[calc(100dvh-env(safe-area-inset-top)-3.75rem)] md:max-w-xl md:px-3 md:pt-2">
      <header className="mb-1.5 flex shrink-0 items-center justify-between gap-2 px-0.5">
        <h1 className="font-monoton text-xl leading-none tracking-wide sm:text-2xl">
          <span className="neon-dollar">$</span>
          <span className="neon-text">HIT</span>
          <span className="ml-1.5 align-middle font-orbitron text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            of the day
          </span>
        </h1>
        <nav className="flex items-center gap-3 font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          <Link
            href={PLAY_PRODUCT.winnersPath}
            className="text-neon-blue hover:underline"
          >
            Winners
          </Link>
          <Link href="/boards" className="hover:text-zinc-300">
            Boards
          </Link>
        </nav>
      </header>
      <div className="min-h-0 flex-1">
        <DayGamePanel />
      </div>
    </div>
  );
}
