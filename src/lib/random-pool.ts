import { apiFetch } from "@/lib/api";
import { tursoExecute } from "@/lib/turso";

export interface PoolToken {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
}

const LISTS = ["majors", "lsts", "currencies", "rwas", "stocks", "metals", "etfs"];
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: PoolToken[] = [];
let cacheTime = 0;

async function fetchList(list: string): Promise<PoolToken[]> {
  try {
    const data = await apiFetch(`/assets/curated?list=${list}&groupBy=asset`);
    const assets = (data?.assets || data?.results || data?.data || []) as Record<string, unknown>[];
    return assets
      .map((a) => {
        const asset = (a.asset || a) as Record<string, unknown>;
        const pv = (asset.primaryVariant || {}) as Record<string, unknown>;
        const market = (pv.market || {}) as Record<string, unknown>;
        return {
          assetId: (asset.id || asset.assetId || a.id || a.assetId) as string,
          name: (asset.name || "Unknown") as string,
          symbol: (asset.symbol || "") as string,
          logo: (asset.imageUrl || market.logoURI || "") as string,
        };
      })
      .filter((t) => t.assetId);
  } catch {
    return [];
  }
}

export async function getPool(): Promise<PoolToken[]> {
  if (cache.length > 0 && Date.now() - cacheTime < CACHE_TTL_MS) return cache;
  const lists = await Promise.all(LISTS.map(fetchList));
  const seen = new Set<string>();
  const merged: PoolToken[] = [];
  for (const list of lists) {
    for (const t of list) {
      if (seen.has(t.assetId)) continue;
      seen.add(t.assetId);
      merged.push(t);
    }
  }
  cache = merged;
  cacheTime = Date.now();
  return cache;
}

export async function getVotedTodayIds(username: string): Promise<Set<string>> {
  try {
    const result = await tursoExecute(
      "SELECT asset_id FROM votes WHERE device_id = ? AND voted_at = date('now')",
      [username]
    );
    return new Set(result.rows.map((r) => String(r[0])));
  } catch {
    return new Set();
  }
}

export async function pickRandomToken(opts: { username?: string | null; excludeAssetId?: string | null } = {}): Promise<PoolToken | null> {
  const pool = await getPool();
  if (pool.length === 0) return null;

  const voted = opts.username ? await getVotedTodayIds(opts.username) : new Set<string>();
  const excludes = new Set(voted);
  if (opts.excludeAssetId) excludes.add(opts.excludeAssetId);

  const available = pool.filter((t) => !excludes.has(t.assetId));

  // If user has voted on every token in the pool (or filter eats everything), fall back
  // to the full pool minus the current asset so we never serve null.
  const source = available.length > 0
    ? available
    : pool.filter((t) => t.assetId !== opts.excludeAssetId);

  if (source.length === 0) return pool[0];
  return source[Math.floor(Math.random() * source.length)];
}
