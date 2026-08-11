import { tursoExecute } from "@/lib/turso";
import { resolveAssetMeta } from "@/lib/resolveMeta";
import { buildAssetCategoryMap } from "@/lib/curatedAssets";

export type LeaderEntry = {
  assetId: string;
  hits: number;
  shits: number;
  name?: string;
  symbol?: string;
  logo?: string;
  category?: string;
};

type CacheEntry = {
  at: number;
  payload: {
    mostHit: LeaderEntry[];
    mostShit: LeaderEntry[];
    categoryMap: Record<string, string>;
  };
};

// Module-level cache survives warm isolates on CF Workers
const g = globalThis as unknown as { __lbCache?: CacheEntry };
const TTL_MS = 60_000;

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(fallback), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch(() => {
      clearTimeout(t);
      resolve(fallback);
    });
  });
}

export async function getLeaderboardData(opts?: {
  limit?: number;
  withCategories?: boolean;
  withMeta?: boolean;
}): Promise<{
  mostHit: LeaderEntry[];
  mostShit: LeaderEntry[];
  categoryMap: Record<string, string>;
}> {
  const limit = opts?.limit ?? 15;
  const withCategories = opts?.withCategories ?? true;
  const withMeta = opts?.withMeta ?? true;

  const hit = g.__lbCache;
  if (hit && Date.now() - hit.at < TTL_MS) {
    return hit.payload;
  }

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
    .slice(0, limit)
    .map(([assetId, v]) => ({ assetId, hits: v.hits, shits: v.shits }));

  const mostShit = Object.entries(assets)
    .filter(([, v]) => v.shits > 0)
    .sort((a, b) => b[1].shits - a[1].shits)
    .slice(0, limit)
    .map(([assetId, v]) => ({ assetId, hits: v.hits, shits: v.shits }));

  const allIds = [
    ...new Set([
      ...mostHit.map((e) => e.assetId),
      ...mostShit.map((e) => e.assetId),
    ]),
  ];

  const meta: Record<string, { name: string; symbol: string; logo: string }> =
    {};

  if (withMeta && allIds.length) {
    // Cap concurrency + hard timeout per id so home never stalls
    const empty = { name: "", symbol: "", logo: "" };
    await Promise.all(
      allIds.map(async (id) => {
        meta[id] = await withTimeout(
          resolveAssetMeta(id).catch(() => empty),
          1800,
          {
            name: id.length > 18 ? `${id.slice(0, 8)}…` : id,
            symbol: "",
            logo: "",
          }
        );
      })
    );
  }

  let categoryMap: Record<string, string> = {};
  if (withCategories) {
    categoryMap = await withTimeout(
      buildAssetCategoryMap().catch(() => ({})),
      2500,
      {}
    );
  }

  const enrich = (entries: typeof mostHit): LeaderEntry[] =>
    entries.map((e) => ({
      ...e,
      ...(meta[e.assetId] || {}),
      category: categoryMap[e.assetId],
    }));

  const payload = {
    mostHit: enrich(mostHit),
    mostShit: enrich(mostShit),
    categoryMap,
  };

  g.__lbCache = { at: Date.now(), payload };
  return payload;
}
