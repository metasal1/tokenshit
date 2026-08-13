import { apiFetch } from "@/lib/api";
import { tursoExecute } from "@/lib/turso";
import { filterMajorsList } from "@/lib/majors-filter";

export interface PoolToken {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
  list?: string;
}

/** Prefer these for “interesting” spins, but never shrink the whole pool. */
const SPICY_IDS = new Set([
  "zora",
  "avalanche-2",
  "bnb",
  "ethereum",
  "hyperliquid",
  "monad",
  "megaeth",
  "delorean",
  "chiliz",
  "paris-saint-germain-fan-token",
  "arsenal-fan-token",
  "bittensor",
  "ethena",
  "lighter",
  "arcium",
  "xmaquina",
  "blend",
  "infinex",
  "billions-network",
  "tron",
  "sui",
  "near",
  "starknet",
  "uniswap",
  "aave",
  "crypto-bpxxfrcx",
  "usd-ai",
  "zcash",
  "solana",
  "bitcoin",
]);

const LISTS = [
  "majors",
  "lsts",
  "currencies",
  "rwas",
  "stocks",
  "metals",
  "etfs",
] as const;

const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: PoolToken[] = [];
let cacheTime = 0;
let orderedIds: string[] = [];

async function fetchList(list: string): Promise<PoolToken[]> {
  try {
    const data = await apiFetch(
      `/assets/curated?list=${encodeURIComponent(list)}&groupBy=asset`
    );
    let assets = (data?.assets ||
      data?.results ||
      data?.data ||
      []) as Record<string, unknown>[];
    if (list === "majors") {
      assets = filterMajorsList(assets as Parameters<typeof filterMajorsList>[0]) as typeof assets;
    }
    return assets
      .map((a) => {
        const asset = (a.asset || a) as Record<string, unknown>;
        const pv = (asset.primaryVariant || {}) as Record<string, unknown>;
        const market = (pv.market || {}) as Record<string, unknown>;
        return {
          assetId: String(
            asset.id || asset.assetId || a.id || a.assetId || ""
          ),
          name: String(asset.name || "Unknown"),
          symbol: String(asset.symbol || ""),
          logo: String(asset.imageUrl || market.logoURI || ""),
          list,
        };
      })
      .filter((t) => t.assetId);
  } catch {
    return [];
  }
}

export async function getPool(): Promise<PoolToken[]> {
  if (cache.length > 0 && Date.now() - cacheTime < CACHE_TTL_MS) return cache;
  const lists = await Promise.all(LISTS.map((l) => fetchList(l)));
  const seen = new Set<string>();
  const merged: PoolToken[] = [];
  for (const list of lists) {
    for (const t of list) {
      if (seen.has(t.assetId)) continue;
      seen.add(t.assetId);
      merged.push(t);
    }
  }
  // Stable order for adjacent/prev-next: majors first then rest
  orderedIds = merged.map((t) => t.assetId);
  cache = merged;
  cacheTime = Date.now();
  return cache;
}

export async function getOrderedIds(): Promise<string[]> {
  await getPool();
  return orderedIds;
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

function pickWeighted(
  pool: PoolToken[],
  spicyBoost = 2.2
): PoolToken | null {
  if (pool.length === 0) return null;
  // Weight: spicy ids higher chance, but every token is eligible
  const weights = pool.map((t) => (SPICY_IDS.has(t.assetId) ? spicyBoost : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/**
 * Pick a random token from ALL curated categories.
 * Avoids recently voted (by username) and explicit excludes.
 * Soft bias toward spicy ids without collapsing to ~10 tokens.
 */
export async function pickRandomToken(
  opts: {
    username?: string | null;
    excludeAssetId?: string | null;
    /** comma-separated recent ids from client */
    excludeIds?: string[] | null;
  } = {}
): Promise<PoolToken | null> {
  const pool = await getPool();
  if (pool.length === 0) return null;

  const excludes = new Set<string>();
  if (opts.excludeAssetId) excludes.add(opts.excludeAssetId);
  for (const id of opts.excludeIds || []) {
    if (id) excludes.add(id);
  }
  if (opts.username) {
    const voted = await getVotedTodayIds(opts.username);
    for (const id of voted) excludes.add(id);
  }

  let available = pool.filter((t) => !excludes.has(t.assetId));

  // If excludes ate everything (voted all), only drop current asset
  if (available.length === 0) {
    available = pool.filter((t) => t.assetId !== opts.excludeAssetId);
  }
  if (available.length === 0) return pool[0];

  // Prefer not-yet-voted; weight spicy lightly
  return pickWeighted(available);
}
