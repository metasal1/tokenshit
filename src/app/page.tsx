import SearchBar from "@/components/SearchBar";
import CuratedLists from "@/components/CuratedLists";
import CategoryLeaderboard from "@/components/CategoryLeaderboard";
import AnimatedLogo from "@/components/AnimatedLogo";
import RandomTokenVote from "@/components/RandomTokenVote";
import GlobalTreasuryBanner from "@/components/GlobalTreasuryBanner";
import XFollowersBadge from "@/components/XFollowersBadge";
import ShareRefButton from "@/components/ShareRefButton";

/**
 * Home is a fast static shell. Heavy leaderboard/meta loads client-side
 * so CF Workers TTFB stays low (~sub-second) instead of 10s SSR waterfalls.
 * Primary CTA = vote (HIT/SHIT). Search sits high + above vote (not clipped).
 */
export const dynamic = "force-static";
export const revalidate = 300;

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-neon/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 pt-8 sm:pt-12 pb-10 text-center relative">
          <h1 className="mb-3">
            <AnimatedLogo size="hero" />
          </h1>
          <p className="text-base sm:text-xl text-zinc-400 mb-1 max-w-2xl mx-auto">
            Every token is shit until proven otherwise.
          </p>
          <p className="text-sm text-zinc-500 mb-5 max-w-xl mx-auto">
            One tap. HIT or SHIT. CT does the rest.
          </p>

          {/* Search first — high on page, dropdown not clipped by overflow */}
          <div className="max-w-2xl mx-auto mb-6 relative z-[60]">
            <SearchBar big />
          </div>

          {/* PRIMARY CTA — vote */}
          <div className="max-w-2xl mx-auto text-left relative z-10">
            <div className="rounded-2xl border border-neon/40 bg-card/80 shadow-[0_0_40px_rgba(57,255,20,0.08)] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Rate this bag
                </h2>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-neon border border-neon/40 rounded-full px-2.5 py-0.5">
                  Vote now
                </span>
              </div>
              <RandomTokenVote />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl w-full px-4 pt-8 pb-4 space-y-3">
        <XFollowersBadge />
        <GlobalTreasuryBanner />
        <ShareRefButton path="/" />
      </section>

      <section className="mx-auto max-w-7xl w-full px-4 pt-10 pb-6">
        <h2 className="text-2xl font-bold mb-2">Arena</h2>
        <p className="text-sm text-zinc-500 mb-6">
          HIT / SHIT by category — crypto, stocks, stables, more.
        </p>
        <CategoryLeaderboard />
      </section>

      <section className="mx-auto max-w-7xl w-full px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Browse the registry</h2>
        <CuratedLists />
      </section>
    </div>
  );
}
