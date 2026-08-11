import SearchBar from "@/components/SearchBar";
import CuratedLists from "@/components/CuratedLists";
import CategoryLeaderboard from "@/components/CategoryLeaderboard";
import AnimatedLogo from "@/components/AnimatedLogo";
import RandomTokenVote from "@/components/RandomTokenVote";
import GlobalTreasuryBanner from "@/components/GlobalTreasuryBanner";

/**
 * Home is a fast static shell. Heavy leaderboard/meta loads client-side
 * so CF Workers TTFB stays low (~sub-second) instead of 10s SSR waterfalls.
 */
export const dynamic = "force-static";
export const revalidate = 300;

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-neon/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center relative">
          <h1 className="mb-4">
            <AnimatedLogo size="hero" />
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 mb-3 max-w-2xl mx-auto">
            Every token is shit until proven otherwise.
          </p>
          <p className="text-sm text-zinc-500 mb-8 max-w-xl mx-auto">
            Verdicts on{" "}
            <span className="text-zinc-300">real Solana assets</span> — crypto,
            LSTs, stocks, stables, RWAs. Built on Foundation Tokens registry.
            Not 10k rugs.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar big />
          </div>
          <div className="max-w-2xl mx-auto mt-6 text-left">
            <GlobalTreasuryBanner />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl w-full px-4 pt-12 pb-6">
        <h2 className="text-2xl font-bold mb-1 text-center">Rate this bag</h2>
        <p className="text-center text-sm text-zinc-500 mb-4">
          One tap. Instant opinion. CT does the rest.
        </p>
        <RandomTokenVote />
      </section>

      <section className="mx-auto max-w-7xl w-full px-4 pt-12 pb-6">
        <h2 className="text-2xl font-bold mb-2">Arena court</h2>
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
