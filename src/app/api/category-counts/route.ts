import { CATEGORIES } from "@/lib/categories";
import { getPool } from "@/lib/random-pool";
import { apiFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: {
  counts: Record<string, number>;
  total: number;
  unique: number;
  source: string;
} | null = null;
let cacheTime = 0;

async function countOne(key: string): Promise<[string, number]> {
  try {
    const data = await apiFetch(`/assets/curated?list=${key}&groupBy=asset`);
    const assets = data?.assets || data?.results || data?.items || data?.data || [];
    return [key, Array.isArray(assets) ? assets.length : 0];
  } catch {
    return [key, 0];
  }
}

/**
 * GET /api/category-counts
 * - counts: per curated list (raw API lengths; may overlap)
 * - unique / total: deduped assetIds (same pool as voting)
 */
export async function GET() {
  if (cache && Date.now() - cacheTime < CACHE_TTL_MS) {
    return Response.json(cache, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  const [entries, pool] = await Promise.all([
    Promise.all(CATEGORIES.map((c) => countOne(c.key))),
    getPool(),
  ]);
  const counts = Object.fromEntries(entries);
  const unique = pool.length;
  const summed = Object.values(counts).reduce((a, b) => a + b, 0);

  cache = {
    counts,
    /** Prefer unique for ticker / public “tokens” number */
    total: unique,
    unique,
    source: "deduped-pool",
  };
  // keep summed available for debugging without breaking clients
  (cache as Record<string, unknown>).summedLists = summed;
  cacheTime = Date.now();

  return Response.json(cache, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
