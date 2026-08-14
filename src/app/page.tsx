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
import { EmojiIcon } from "@/components/EmojiIcon";

/**
 * Home: PLAY ($SHIT OF THE DAY) + VOTE (free arena) — mobile & desktop.
 */
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex flex-col pb-8">
      {/* Hero */}
      <section className="relative border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-neon/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-3 sm:px-4 pt-4 sm:pt-6 pb-4 relative text-center">
          <h1 className="mb-1">
            <AnimatedLogo size="hero" />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mb-3 max-w-md mx-auto">
            Every token is shit until proven otherwise.
          </p>

          {/* Jump links — mobile thumb friendly */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <a
              href="#play"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-neon px-4 py-2 text-sm font-bold text-black font-orbitron tracking-wide uppercase hover:brightness-110"
            >
              <EmojiIcon size={16}>🎯</EmojiIcon>
              Play
            </a>
            <a
              href="#vote"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-white font-orbitron tracking-wide uppercase hover:border-neon/50"
            >
              <EmojiIcon size={16}>💀</EmojiIcon>
              Vote
            </a>
            <Link
              href="/claim"
              className="inline-flex min-h-10 items-center rounded-full border border-border px-4 py-2 text-xs font-orbitron tracking-wide uppercase text-zinc-400 hover:text-white"
            >
              Claim
            </Link>
            <Link
              href="/memes"
              className="inline-flex min-h-10 items-center rounded-full border border-border px-4 py-2 text-xs font-orbitron tracking-wide uppercase text-zinc-400 hover:text-white"
            >
              Memes
            </Link>
          </div>

          <div className="max-w-xl mx-auto relative z-[60]">
            <SearchBar big />
          </div>
        </div>
      </section>

      {/* PLAY + VOTE grid */}
      <section className="mx-auto w-full max-w-6xl px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 lg:items-start">
          {/* PLAY */}
          <div
            id="play"
            className="scroll-mt-20 rounded-2xl border border-neon/40 bg-card/90 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-neon/20 bg-neon/5">
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-neon">
                  Play
                </p>
                <h2 className="text-lg sm:text-xl font-monoton leading-none">
                  <span className="neon-dollar">$</span>
                  <span className="neon-text">SHIT</span>
                  <span className="ml-1.5 align-middle text-[10px] font-orbitron tracking-wider text-zinc-500 uppercase">
                    of the day
                  </span>
                </h2>
              </div>
              <Link
                href={PLAY_PRODUCT.path}
                className="shrink-0 text-[10px] sm:text-xs font-orbitron uppercase tracking-wider text-neon-blue hover:underline px-2 py-1"
              >
                Full page →
              </Link>
            </div>
            <div className="p-2.5 sm:p-3 text-left">
              <p className="text-[11px] text-zinc-500 mb-2 px-0.5">
                Play 1k · HIT or SHIT · VRF pot · every UTC hour
              </p>
              <DayGamePanel compactTitle dense />
            </div>
          </div>

          {/* VOTE */}
          <div
            id="vote"
            className="scroll-mt-20 rounded-2xl border border-border bg-card/90 overflow-hidden lg:sticky lg:top-16"
          >
            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-border bg-zinc-900/40">
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-zinc-500">
                  Vote
                </p>
                <h2 className="text-base sm:text-lg font-bold text-white font-orbitron tracking-wide uppercase">
                  Free arena
                </h2>
              </div>
              <span className="shrink-0 text-[9px] font-orbitron uppercase tracking-wider text-zinc-500 border border-border rounded-full px-2 py-0.5">
                Free
              </span>
            </div>
            <div className="p-3 sm:p-4">
              <RandomTokenVote />
            </div>
          </div>
        </div>
      </section>

      {/* Meta strip */}
      <section className="mx-auto max-w-6xl w-full px-3 sm:px-4 pt-5 pb-2 space-y-3">
        <XFollowersBadge />
        <GlobalTreasuryBanner />
        <ShareRefButton path="/" />
      </section>

      {/* Boards */}
      <section className="mx-auto max-w-6xl w-full px-3 sm:px-4 pt-6 pb-4 border-t border-border mt-4">
        <h2 className="text-lg sm:text-xl font-bold mb-1 font-orbitron tracking-wide uppercase">
          Arena boards
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mb-4">
          HIT / SHIT tallies by category.
        </p>
        <CategoryLeaderboard />
      </section>

      {/* Registry */}
      <section className="mx-auto max-w-6xl w-full px-3 sm:px-4 py-8 border-t border-border">
        <h2 className="text-lg sm:text-xl font-bold mb-4 font-orbitron tracking-wide uppercase">
          Browse the registry
        </h2>
        <CuratedLists />
      </section>
    </div>
  );
}
