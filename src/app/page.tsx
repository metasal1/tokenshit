import SearchBar from "@/components/SearchBar";
import CategoryLeaderboard from "@/components/CategoryLeaderboard";
import AnimatedLogo from "@/components/AnimatedLogo";
import RandomTokenVote from "@/components/RandomTokenVote";
import GlobalTreasuryBanner from "@/components/GlobalTreasuryBanner";
import ShareRefButton from "@/components/ShareRefButton";
import HomePlayTeaser from "@/components/HomePlayTeaser";
import Link from "next/link";
import type { Metadata } from "next";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";

/**
 * Home — clean entry:
 * 1. Brand + search
 * 2. Play (main)
 * 3. Vote (free)
 * 4. Quick links
 * 5. Boards (secondary)
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...pageMeta({
    title: "TOKEN$HIT — Every token is shit until proven otherwise",
    description:
      "Play $HIT OF THE DAY, vote HIT or SHIT on Solana assets, claim rewards, swap $TOKENSHIT.",
    path: "/",
    og: "home",
  }),
  title: {
    absolute: "TOKEN$HIT — Every token is shit until proven otherwise",
  },
};

const QUICK = [
  { href: "/claim", label: "Claim", emoji: "🎁" },
  { href: "/swap", label: "Swap", emoji: "🔁" },
  { href: "/memes", label: "Memes", emoji: "🎨" },
  { href: "/whales", label: "Whales", emoji: "🐋" },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col pb-10">
      {/* Compact hero */}
      <header className="relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neon/[0.07] to-transparent" />
        <div className="relative mx-auto max-w-lg px-3 sm:px-4 pt-5 sm:pt-7 pb-4 text-center">
          <h1 className="mb-1.5">
            <AnimatedLogo size="hero" />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto leading-snug">
            Every token is shit until proven otherwise.
          </p>
          <div className="mt-4 max-w-md mx-auto relative z-[60]">
            <SearchBar big />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg px-3 sm:px-4 space-y-5 pt-5">
        {/* 1 · Play */}
        <HomePlayTeaser />

        {/* 2 · Vote */}
        <section
          id="vote"
          className="scroll-mt-20 rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="text-left">
              <p className="text-[10px] font-orbitron uppercase tracking-[0.18em] text-zinc-500">
                Free
              </p>
              <h2 className="text-sm font-bold font-orbitron uppercase tracking-wide text-white">
                Vote
              </h2>
            </div>
            <span className="text-[10px] text-zinc-600 font-orbitron uppercase tracking-wider">
              HIT · SHIT
            </span>
          </div>
          <div className="p-3 sm:p-4">
            <RandomTokenVote />
          </div>
        </section>

        {/* Quick links */}
        <nav className="grid grid-cols-4 gap-2" aria-label="Quick links">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="flex flex-col items-center justify-center gap-1 min-h-[4.25rem] rounded-xl border border-border bg-card/80 hover:border-neon/40 hover:bg-card transition-colors px-1"
            >
              <EmojiIcon size={20}>{q.emoji}</EmojiIcon>
              <span className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-300">
                {q.label}
              </span>
            </Link>
          ))}
        </nav>

        <GlobalTreasuryBanner compact />
        <ShareRefButton path="/" />

        {/* Boards — secondary */}
        <section className="pt-2 border-t border-border">
          <h2 className="text-sm font-orbitron uppercase tracking-wide text-zinc-400 mb-3">
            Arena boards
          </h2>
          <CategoryLeaderboard />
        </section>
      </div>
    </div>
  );
}
