/**
 * Multi-source live USD prices for the hour game.
 * Tokens.xyz majors list is the universe, but its absolute prices go stale
 * (open == live forever → 0% moves). Prefer Jupiter (Solana mints) then CoinGecko.
 */
import { apiFetch } from "@/lib/api";

export type PriceHint = {
  assetId: string;
  symbol: string;
  name: string;
  logo: string;
  mint?: string | null;
  coinId?: string | null;
  /** Tokens.xyz fallback (often lagging) */
  fallbackPrice: number;
  volume24h: number;
  /** Tokens.xyz reported 1h % (informational only) */
  txyzChange1h?: number | null;
};

export type PricedMajor = PriceHint & {
  price: number;
  source: "jupiter" | "coingecko" | "tokens.xyz";
};

const JUP_V3 = "https://api.jup.ag/price/v3";
const CG_SIMPLE = "https://api.coingecko.com/api/v3/simple/price";

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function fetchJupiterUsd(
  mints: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (!mints.length) return map;
  const key = process.env.JUP_API_KEY || process.env.JUPITER_API_KEY || "";
  for (const group of chunk(mints, 40)) {
    try {
      const url = `${JUP_V3}?ids=${group.map(encodeURIComponent).join(",")}`;
      const headers: Record<string, string> = {
        Accept: "application/json",
        "User-Agent": "tokenshit-hour-game/1.0",
      };
      if (key) headers["x-api-key"] = key;
      const res = await fetch(url, {
        headers,
        // CF Workers: don't cache across hours
        cache: "no-store",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as Record<
        string,
        { usdPrice?: number; price?: number } | null
      >;
      for (const [mint, row] of Object.entries(data || {})) {
        const p = row?.usdPrice ?? row?.price;
        if (typeof p === "number" && Number.isFinite(p) && p > 0) {
          map.set(mint, p);
        }
      }
    } catch {
      /* try next chunk */
    }
  }
  return map;
}

async function fetchCoinGeckoUsd(
  coinIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (!coinIds.length) return map;
  const unique = [...new Set(coinIds.filter(Boolean))];
  for (const group of chunk(unique, 80)) {
    try {
      const url = `${CG_SIMPLE}?ids=${group.map(encodeURIComponent).join(",")}&vs_currencies=usd`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "tokenshit-hour-game/1.0",
        },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as Record<string, { usd?: number }>;
      for (const [id, row] of Object.entries(data || {})) {
        const p = row?.usd;
        if (typeof p === "number" && Number.isFinite(p) && p > 0) {
          map.set(id, p);
        }
      }
    } catch {
      /* */
    }
  }
  return map;
}

/** Pull majors universe from Tokens.xyz (ids, mints, logos) — not the price truth. */
export async function fetchMajorsUniverse(): Promise<PriceHint[]> {
  const data = await apiFetch(`/assets/curated?list=majors&groupBy=asset`);
  const raw = (data?.assets || data?.results || []) as Array<
    Record<string, unknown>
  >;
  const { filterRealMajors, rowAssetId, rowName, rowSymbol, rowLogo, rowVolume24h } =
    await import("@/lib/majors-filter");

  const filtered = filterRealMajors(raw as never[]);
  const out: PriceHint[] = [];
  for (const row of filtered) {
    const a = ((row as { asset?: Record<string, unknown> }).asset ||
      row) as Record<string, unknown>;
    const assetId = rowAssetId(row as never);
    if (!assetId) continue;
    const stats = (a.stats || {}) as Record<string, unknown>;
    const cm = (a.canonicalMarket || {}) as Record<string, unknown>;
    const pv = (a.primaryVariant || {}) as Record<string, unknown>;
    const mint = pv.mint ? String(pv.mint) : null;
    const coinId = cm.coinId ? String(cm.coinId) : null;
    const fallback =
      (typeof stats.price === "number" && stats.price > 0
        ? stats.price
        : null) ??
      (typeof cm.price === "number" && cm.price > 0 ? cm.price : null) ??
      0;
    if (!(fallback > 0) && !mint && !coinId) continue;
    const ch1 = stats.priceChange1hPercent;
    out.push({
      assetId,
      symbol: rowSymbol(row as never) || String(a.symbol || ""),
      name: rowName(row as never) || assetId,
      logo: rowLogo(row as never),
      mint,
      coinId,
      fallbackPrice: fallback > 0 ? fallback : 0,
      volume24h: rowVolume24h(row as never),
      txyzChange1h:
        typeof ch1 === "number" && Number.isFinite(ch1) ? ch1 : null,
    });
  }
  return out;
}

/** Resolve live USD for each major via Jupiter → CoinGecko → Tokens.xyz. */
export async function priceMajorsLive(
  hints?: PriceHint[]
): Promise<PricedMajor[]> {
  const universe = hints || (await fetchMajorsUniverse());
  const mints = universe.map((u) => u.mint).filter(Boolean) as string[];
  const coinIds = universe.map((u) => u.coinId).filter(Boolean) as string[];

  const [jup, cg] = await Promise.all([
    fetchJupiterUsd(mints),
    fetchCoinGeckoUsd(coinIds),
  ]);

  return universe.map((u) => {
    let price = 0;
    let source: PricedMajor["source"] = "tokens.xyz";
    if (u.mint && jup.has(u.mint)) {
      price = jup.get(u.mint)!;
      source = "jupiter";
    } else if (u.coinId && cg.has(u.coinId)) {
      price = cg.get(u.coinId)!;
      source = "coingecko";
    } else if (u.fallbackPrice > 0) {
      price = u.fallbackPrice;
      source = "tokens.xyz";
    }
    return { ...u, price, source };
  }).filter((m) => m.price > 0);
}
