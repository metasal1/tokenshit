import SearchBar from "@/components/SearchBar";
import CategoryLeaderboard from "@/components/CategoryLeaderboard";
import AnimatedLogo from "@/components/AnimatedLogo";
import RandomTokenVote from "@/components/RandomTokenVote";
import GlobalTreasuryBanner from "@/components/GlobalTreasuryBanner";
import ShareRefButton from "@/components/ShareRefButton";
import HomePlayTeaser from "@/components/HomePlayTeaser";
import CopyableAddress from "@/components/CopyableAddress";
import Link from "next/link";
import type { Metadata } from "next";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";
import { SHIT_MINT, SHIT_SYMBOL } from "@/lib/shit-token";

/**
 * Home
 * Mobile: single col
 * Desktop: wide hero · Play | Vote dual · boards full width
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...pageMeta({
    title: "TOKEN$HIT — Every token is shit until proven otherwise",
    description:
      "Play $HIT OF THE DAY, vote HIT or SHIT on Solana assets, claim rewards.",
    path: "/",
    og: "home",
  }),
  title: {
    absolute: "TOKEN$HIT — Every token is shit until proven otherwise",
  },
};

const QUICK = [
  { href: "/claim", label: "Claim", emoji: "🎁" },
  { href: "/play", label: "Play", emoji: "🎯" },
  { href: "/memes", label: "Memes", emoji: "🎨" },
  { href: "/whales", label: "Whales", emoji: "🐋" },
  { href: "/referrals", label: "Referrals", emoji: "🔗" },
  { href: "/stats", label: "Stats", emoji: "📊" },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col pb-12 lg:pb-16">
      {/* Hero — full width, content capped */}
      <header className="relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neon/[0.09] via-neon/[0.03] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-6 sm:pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
            {/* Brand */}
            <div className="text-center lg:text-left min-w-0 lg:max-w-xl">
              <h1 className="mb-2 lg:mb-3">
                <AnimatedLogo size="hero" />
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Every token is shit until proven otherwise.
              </p>
            </div>

            {/* CA + search — desktop right column */}
            <div className="w-full lg:w-[min(28rem,42%)] space-y-3 shrink-0">
              <CopyableAddress
                address={SHIT_MINT}
                label={`$${SHIT_SYMBOL} CA`}
                explorer={`https://solscan.io/token/${SHIT_MINT}`}
              />
              <div className="relative z-[60]">
                <SearchBar big />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6 lg:space-y-8 pt-5 sm:pt-6 lg:pt-8">
        {/* Main: Play + Vote — dual on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 lg:items-stretch">
          <div className="min-w-0 h-full [&_section]:h-full">
            <HomePlayTeaser />
          </div>

          <section
            id="vote"
            className="scroll-mt-24 rounded-2xl border border-border bg-card overflow-hidden flex flex-col min-h-0 lg:min-h-full"
          >
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border shrink-0">
              <div className="text-left">
                <p className="text-[10px] font-orbitron uppercase tracking-[0.18em] text-zinc-500">
                  Free
                </p>
                <h2 className="text-sm sm:text-base font-bold font-orbitron uppercase tracking-wide text-white">
                  Vote
                </h2>
              </div>
              <span className="text-[10px] text-zinc-600 font-orbitron uppercase tracking-wider">
                HIT · SHIT
              </span>
            </div>
            <div className="p-3 sm:p-4 lg:p-5 flex-1 min-h-0">
              <RandomTokenVote />
            </div>
          </section>
        </div>

        {/* Quick links — more columns on desktop */}
        <nav
          className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3"
          aria-label="Quick links"
        >
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 min-h-[4.25rem] sm:min-h-[3.25rem] rounded-xl border border-border bg-card/80 hover:border-neon/40 hover:bg-card hover:shadow-[0_0_24px_rgba(57,255,20,0.08)] transition-all px-2 sm:px-3"
            >
              <EmojiIcon size={20}>{q.emoji}</EmojiIcon>
              <span className="text-[10px] sm:text-xs font-orbitron uppercase tracking-wider text-zinc-300">
                {q.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Treasury + share — side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 lg:gap-4 lg:items-center">
          <GlobalTreasuryBanner compact />
          <div className="lg:justify-self-end">
            <ShareRefButton path="/" />
          </div>
        </div>

        {/* Boards */}
        <section className="pt-2 sm:pt-4 border-t border-border">
          <div className="flex items-end justify-between gap-3 mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-orbitron uppercase tracking-wide text-zinc-300">
              Arena boards
            </h2>
            <Link
              href="/stats"
              className="text-[11px] font-orbitron uppercase tracking-wider text-neon-blue hover:underline shrink-0"
            >
              All stats
            </Link>
          </div>
          <CategoryLeaderboard />
        </section>
      </div>
    </div>
  );
}
