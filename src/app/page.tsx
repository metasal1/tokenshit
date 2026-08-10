import SearchBar from "@/components/SearchBar";
import CuratedLists from "@/components/CuratedLists";
import CategoryLeaderboard from "@/components/CategoryLeaderboard";
import AnimatedLogo from "@/components/AnimatedLogo";
import RandomTokenVote from "@/components/RandomTokenVote";
import { apiFetch } from "@/lib/api";
import { tursoExecute } from "@/lib/turso";
import {
  buildAssetCategoryMap,
  fetchCuratedList,
  type CuratedAssetItem,
} from "@/lib/curatedAssets";

export const revalidate = 60;

async function getLeaderboard() {
  try {
    const result = await tursoExecute(
      `SELECT asset_id, vote, COUNT(*) as cnt
       FROM votes
       GROUP BY asset_id, vote
       ORDER BY cnt DESC`,
      []
    );

    const assets: Record<string, { hits: number; shits: number }> = {};
    for (const row of result.rows) {
      const id = row[0] as string;
      if (!assets[id]) assets[id] = { hits: 0, shits: 0 };
      if (row[1] === "hit") assets[id].hits = Number(row[2]);
      if (row[1] === "shit") assets[id].shits = Number(row[2]);
    }

    const mostHit = Object.entries(assets)
      .filter(([, v]) => v.hits > 0)
      .sort((a, b) => b[1].hits - a[1].hits)
      .slice(0, 40)
      .map(([assetId, v]) => ({ assetId, hits: v.hits, shits: v.shits }));

    const mostShit = Object.entries(assets)
      .filter(([, v]) => v.shits > 0)
      .sort((a, b) => b[1].shits - a[1].shits)
      .slice(0, 40)
      .map(([assetId, v]) => ({ assetId, hits: v.hits, shits: v.shits }));

    const allIds = [
      ...new Set([
        ...mostHit.map((e) => e.assetId),
        ...mostShit.map((e) => e.assetId),
      ]),
    ];

    const meta: Record<string, { name: string; symbol: string; logo: string }> =
      {};
    await Promise.all(
      allIds.map(async (id) => {
        try {
          const d = await apiFetch(`/assets/${encodeURIComponent(id)}`);
          const a = d.asset || d;
          meta[id] = {
            name: a.name || id,
            symbol: a.symbol || "",
            logo: a.imageUrl || a.primaryVariant?.market?.logoURI || "",
          };
        } catch {
          /* skip */
        }
      })
    );

    let categoryMap: Record<string, string> = {};
    try {
      categoryMap = await buildAssetCategoryMap();
    } catch {
      categoryMap = {};
    }

    const enrich = (entries: typeof mostHit) =>
      entries.map((e) => ({
        ...e,
        ...meta[e.assetId],
        category: categoryMap[e.assetId],
      }));

    return {
      mostHit: enrich(mostHit),
      mostShit: enrich(mostShit),
      categoryMap,
    };
  } catch {
    return { mostHit: [], mostShit: [], categoryMap: {} };
  }
}

export default async function Home() {
  const [leaderboard, curatedMajors] = await Promise.all([
    getLeaderboard(),
    fetchCuratedList("majors").catch(() => [] as CuratedAssetItem[]),
  ]);

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
        <CategoryLeaderboard
          mostHit={leaderboard.mostHit}
          mostShit={leaderboard.mostShit}
          categoryMap={leaderboard.categoryMap}
        />
      </section>

      <section className="mx-auto max-w-7xl w-full px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Browse the registry</h2>
        <CuratedLists initialAssets={curatedMajors} />
      </section>
    </div>
  );
}
