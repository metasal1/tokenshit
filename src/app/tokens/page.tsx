import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import CuratedLists from "@/components/CuratedLists";

export const metadata: Metadata = pageMeta({
  title: "Tokens",
  description:
    "Every Tokens.xyz curated asset. Search by name or ticker. Open a token page.",
  path: "/tokens",
  og: "default",
});

export default function TokensPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 pb-20">
      <header className="mb-6">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.2em] text-neon">
          Registry
        </p>
        <h1 className="mt-2 font-monoton text-3xl sm:text-4xl leading-none">
          <span className="neon-text">TOKENS</span>
        </h1>
        <p className="mt-3 text-sm text-zinc-400 max-w-xl">
          Full Tokens.xyz catalog. Unique assets, no duplicates. Play stays
          majors-only.
        </p>
      </header>
      <CuratedLists initialList="all" />
    </div>
  );
}
