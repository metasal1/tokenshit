import SearchBar from "@/components/SearchBar";
import CuratedLists from "@/components/CuratedLists";
import Leaderboard from "@/components/Leaderboard";
import AnimatedLogo from "@/components/AnimatedLogo";
import { apiFetch } from "@/lib/api";
import { tursoExecute } from "@/lib/turso";

export const revalidate = 60;

async function getLeaderboard() {
  try {
    const result = await tursoExecute(
      `SELECT asset_id, vote, COUNT(*) as cnt
       FROM votes
       WHERE voted_at = date('now')
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
      .slice(0, 5)
      .map(([assetId, v]) => ({ assetId, hits: v.hits, shits: v.shits }));

    const mostShit = Object.entries(assets)
      .filter(([, v]) => v.shits > 0)
      .sort((a, b) => b[1].shits - a[1].shits)
      .slice(0, 5)
      .map(([assetId, v]) => ({ assetId, hits: v.hits, shits: v.shits }));

    // Batch-resolve token metadata
    const allIds = [
      ...new Set([
        ...mostHit.map((e) => e.assetId),
        ...mostShit.map((e) => e.assetId),
      ]),
    ];

    const meta: Record<string, { name: string; symbol: string; logo: string }> = {};
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
          // skip
        }
      })
    );

    const enrich = (entries: typeof mostHit) =>
      entries.map((e) => ({ ...e, ...meta[e.assetId] }));

    return { mostHit: enrich(mostHit), mostShit: enrich(mostShit) };
  } catch {
    return { mostHit: [], mostShit: [] };
  }
}

interface CuratedAsset {
  assetId: string;
  name: string;
  symbol: string;
  logo?: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
  mints?: string[];
  variants?: Array<{ mint?: string }>;
}

async function getCuratedMajors() {
  try {
    const data = await apiFetch("/assets/curated?list=majors&groupBy=asset");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any[] = Array.isArray(data)
      ? data
      : data.assets || data.results || data.items || [];

    // Map API shape to our CuratedAsset shape
    const items: CuratedAsset[] = raw.map((a) => ({
      assetId: a.assetId,
      name: a.name,
      symbol: a.symbol,
      logo: a.imageUrl || a.primaryVariant?.market?.logoURI || undefined,
      price: a.stats?.price ?? a.price ?? undefined,
      priceChange24h: a.stats?.priceChange24hPercent ?? a.priceChange24h ?? undefined,
      marketCap: a.stats?.marketCap ?? a.marketCap ?? undefined,
      volume24h: a.stats?.volume24hUSD ?? a.volume24h ?? undefined,
    }));

    return items;
  } catch {
    return [];
  }
}

export default async function Home() {
  // Fetch leaderboard and curated majors in parallel
  const [leaderboard, curatedMajors] = await Promise.all([
    getLeaderboard(),
    getCuratedMajors(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-neon/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center relative">
          <h1 className="mb-4">
            <AnimatedLogo size="hero" />
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Every token is shit until proven otherwise.
            <br />
            <span className="text-zinc-500">
              Search Solana tokens, check risk scores, and find out which ones
              are certified $HIT.
            </span>
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar big />
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="mx-auto max-w-7xl w-full px-4 pt-12 pb-6">
        <h2 className="text-2xl font-bold mb-6">
          Today&apos;s Verdicts
        </h2>
        <Leaderboard mostHit={leaderboard.mostHit} mostShit={leaderboard.mostShit} />
      </section>

      {/* Curated Lists */}
      <section className="mx-auto max-w-7xl w-full px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">
          Browse Tokens
        </h2>
        <CuratedLists initialAssets={curatedMajors} />
      </section>
    </div>
  );
}
