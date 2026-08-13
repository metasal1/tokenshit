import SearchBar from "@/components/SearchBar";
import CuratedLists from "@/components/CuratedLists";
import CategoryLeaderboard from "@/components/CategoryLeaderboard";
import AnimatedLogo from "@/components/AnimatedLogo";
import RandomTokenVote from "@/components/RandomTokenVote";
import GlobalTreasuryBanner from "@/components/GlobalTreasuryBanner";
import XFollowersBadge from "@/components/XFollowersBadge";
import ShareRefButton from "@/components/ShareRefButton";
import DayGamePanel from "@/components/DayGamePanel";
import Link from "next/link";
import { PLAY_PRODUCT } from "@/lib/hour-product";

/**
 * Homepage hero = $SHIT OF THE DAY (/play)
 */
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-neon/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl px-3 sm:px-4 pt-6 sm:pt-10 pb-8 text-center relative">
          <h1 className="mb-2">
            <AnimatedLogo size="hero" />
          </h1>
          <p className="text-[10px] sm:text-xs font-orbitron uppercase tracking-[0.28em] text-neon mb-2">
            Main game
          </p>
          <p className="text-2xl sm:text-3xl font-monoton leading-none mb-2">
            <span className="neon-dollar">$</span>
            <span className="neon-text">SHIT</span>
            <span className="block text-sm sm:text-base font-orbitron tracking-[0.2em] text-zinc-400 mt-2 uppercase">
              of the day
            </span>
          </p>
          <p className="text-base sm:text-lg text-zinc-400 mb-1 max-w-2xl mx-auto">
            {PLAY_PRODUCT.tagline}
          </p>
          <p className="text-sm text-zinc-500 mb-2 max-w-xl mx-auto">
            1,000 $TOKENSHIT · real majors · VRF
          </p>
          <p className="mb-5">
            <Link
              href={PLAY_PRODUCT.path}
              className="text-xs font-orbitron uppercase tracking-wider text-neon-blue hover:underline"
            >
              Open {PLAY_PRODUCT.path} →
            </Link>
          </p>

          <div className="max-w-lg mx-auto text-left relative z-10 mb-8">
            <DayGamePanel />
          </div>

          <div className="max-w-2xl mx-auto mb-4 relative z-[60]">
            <SearchBar big />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl w-full px-4 pt-8 pb-4 space-y-3">
        <XFollowersBadge />
        <GlobalTreasuryBanner />
        <ShareRefButton path="/" />
      </section>

      <section className="mx-auto max-w-2xl w-full px-4 py-8 border-t border-border">
        <div className="rounded-2xl border border-border bg-card/80 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm sm:text-base font-bold text-white font-orbitron tracking-wide uppercase">
              Free arena vote
            </h2>
            <span className="text-[10px] sm:text-xs font-orbitron uppercase tracking-wider text-zinc-500 border border-border rounded-full px-2.5 py-0.5">
              Practice
            </span>
          </div>
          <RandomTokenVote />
        </div>
      </section>

      <section className="mx-auto max-w-7xl w-full px-4 pt-6 pb-6">
        <h2 className="text-2xl font-bold mb-2 font-orbitron tracking-wide uppercase">
          Arena boards
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          HIT / SHIT tallies by category.
        </p>
        <CategoryLeaderboard />
      </section>

      <section className="mx-auto max-w-7xl w-full px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 font-orbitron tracking-wide uppercase">
          Browse the registry
        </h2>
        <CuratedLists />
      </section>
    </div>
  );
}
