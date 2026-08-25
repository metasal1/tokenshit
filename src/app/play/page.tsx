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

export default function PlayPage() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-env(safe-area-inset-top)-3.25rem-4rem)] w-full max-w-lg flex-col px-2 pt-1 md:h-[calc(100dvh-env(safe-area-inset-top)-3.5rem)] md:max-w-xl md:px-3">
      <header className="mb-1 flex shrink-0 items-center justify-between px-0.5">
        <h1 className="font-monoton text-lg leading-none sm:text-xl">
          <span className="neon-dollar">$</span>
          <span className="neon-text">HIT</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/posters"
            className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500 hover:text-neon"
          >
            Poster
          </Link>
          <Link
            href={PLAY_PRODUCT.winnersPath}
            className="font-orbitron text-[10px] uppercase tracking-wider text-neon-blue"
          >
            Winners
          </Link>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <DayGamePanel />
      </div>
    </div>
  );
}
