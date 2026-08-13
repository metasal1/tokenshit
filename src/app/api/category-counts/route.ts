import { CATEGORIES } from "@/lib/categories";
import { getPool } from "@/lib/random-pool";
import { apiFetch } from "@/lib/api";
import { filterMajorsList } from "@/lib/majors-filter";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: {
  counts: Record<string, number>;
  total: number;
  unique: number;
  source: string;
  summedLists?: number;
  majorsRaw?: number;
} | null = null;
let cacheTime = 0;

async function countOne(key: string): Promise<[string, number, number?]> {
  try {
    const data = await apiFetch(`/assets/curated?list=${key}&groupBy=asset`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let assets: any[] = data?.assets || data?.results || data?.items || data?.data || [];
    if (!Array.isArray(assets)) assets = [];
    const raw = assets.length;
    if (key === "majors") {
      assets = filterMajorsList(assets);
    }
    return [key, assets.length, key === "majors" ? raw : undefined];
  } catch {
    return [key, 0];
  }
}

/**
 * GET /api/category-counts
 * - counts: per list after quality filter (majors ≠ tier3 dust)
 * - unique / total: deduped vote-pool size
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
  const counts: Record<string, number> = {};
  let majorsRaw: number | undefined;
  for (const [k, n, raw] of entries) {
    counts[k] = n;
    if (raw != null) majorsRaw = raw;
  }
  const unique = pool.length;
  const summed = Object.values(counts).reduce((a, b) => a + b, 0);

  cache = {
    counts,
    total: unique,
    unique,
    source: "deduped-pool+majors-filter",
    summedLists: summed,
    majorsRaw,
  };
  cacheTime = Date.now();

  return Response.json(cache, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
