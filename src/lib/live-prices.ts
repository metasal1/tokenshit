/**
 * Multi-source live USD prices for the hour game.
 * Universe: Tokens.xyz majors. Price truth:
 *   Jupiter → CoinGecko → DexScreener (sanity-checked) → txyz birdeye market.
 * Reject Dex/Jup outliers that diverge wildly from known fallback (e.g. SOL $0.008).
 */
import { apiFetch } from "@/lib/api";

export type PriceHint = {
  assetId: string;
  symbol: string;
  name: string;
  logo: string;
  mint?: string | null;
  coinId?: string | null;
  fallbackPrice: number;
  volume24h: number;
  txyzChange1h?: number | null;
};

export type PricedMajor = PriceHint & {
  price: number;
  source: "jupiter" | "dexscreener" | "coingecko" | "tokens.xyz";
};

const JUP_V3 = "https://api.jup.ag/price/v3";
const CG_SIMPLE = "https://api.coingecko.com/api/v3/simple/price";
const DEX_TOKENS = "https://api.dexscreener.com/latest/dex/tokens";
const WSOL = "So11111111111111111111111111111111111111112";

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function normMint(m: string): string {
  return m.trim();
}

/** True if candidate is within a sensible band of reference (blocks inverted/micro pairs). */
function priceSane(candidate: number, ref: number | null | undefined): boolean {
  if (!(candidate > 0) || !Number.isFinite(candidate)) return false;
  if (!(ref && ref > 0)) return true;
  const r = candidate / ref;
  // Allow up to ~±60% hour move; reject 1000x bugs (SOL 75 → 0.008)
  return r >= 0.4 && r <= 2.5;
}

async function fetchJupiterUsd(mints: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (!mints.length) return map;
  const key = process.env.JUP_API_KEY || process.env.JUPITER_API_KEY || "";
  for (const group of chunk(mints, 40)) {
    try {
      const url = `${JUP_V3}?ids=${group.map(encodeURIComponent).join(",")}`;
      const headers: Record<string, string> = {
        Accept: "application/json",
        "User-Agent": "tokenshit-hour-game/1.1",
      };
      if (key) headers["x-api-key"] = key;
      const res = await fetch(url, { headers, cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as Record<
        string,
        { usdPrice?: number; price?: number } | null
      >;
      for (const [mint, row] of Object.entries(data || {})) {
        const p = row?.usdPrice ?? row?.price;
        if (typeof p === "number" && Number.isFinite(p) && p > 0) {
          map.set(normMint(mint), p);
        }
      }
    } catch {
      /* */
    }
  }
  return map;
}

/**
 * DexScreener: best solana pair where mint is the **base** token.
 * Prefer high liquidity; skip dust pools.
 */
async function fetchDexScreenerUsd(
  mints: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (!mints.length) return map;
  const want = new Set(mints.map(normMint));
  for (const group of chunk(mints, 30)) {
    try {
      const url = `${DEX_TOKENS}/${group.join(",")}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "tokenshit-hour-game/1.1",
        },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        pairs?: Array<{
          chainId?: string;
          baseToken?: { address?: string };
          quoteToken?: { address?: string };
          priceUsd?: string;
          liquidity?: { usd?: number };
        }>;
      };
      const best = new Map<string, { px: number; score: number }>();
      for (const p of data.pairs || []) {
        const base = normMint(p.baseToken?.address || "");
        if (!base || !want.has(base)) continue;
        if (p.chainId && p.chainId !== "solana") continue;
        const px = Number(p.priceUsd);
        const liq = Number(p.liquidity?.usd || 0);
        if (!(px > 0) || !(liq >= 5_000)) continue;
        const score = liq;
        const prev = best.get(base);
        if (!prev || score > prev.score) best.set(base, { px, score });
      }
      for (const [mint, row] of best) {
        if (!map.has(mint)) map.set(mint, row.px);
      }
    } catch {
      /* */
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
  const cgKey =
    process.env.COINGECKO_API_KEY ||
    process.env.CG_API_KEY ||
    process.env.COINGECKO_DEMO_API_KEY ||
    "";
  for (const group of chunk(unique, 80)) {
    try {
      const url = `${CG_SIMPLE}?ids=${group.map(encodeURIComponent).join(",")}&vs_currencies=usd`;
      const headers: Record<string, string> = {
        Accept: "application/json",
        "User-Agent": "tokenshit-hour-game/1.1",
      };
      if (cgKey) headers["x-cg-demo-api-key"] = cgKey;
      const res = await fetch(url, { headers, cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as Record<string, { usd?: number }>;
      for (const [id, row] of Object.entries(data || {})) {
        const p = row?.usd;
        if (typeof p === "number" && Number.isFinite(p) && p > 0) map.set(id, p);
      }
    } catch {
      /* */
    }
  }
  return map;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/** Universe from Tokens.xyz — mints, logos, birdeye market price (not rounded stats). */
export async function fetchMajorsUniverse(): Promise<PriceHint[]> {
  const data = await apiFetch(`/assets/curated?list=majors&groupBy=asset`);
  const raw = (data?.assets || data?.results || []) as Array<
    Record<string, unknown>
  >;
  const {
    filterRealMajors,
    rowAssetId,
    rowName,
    rowSymbol,
    rowLogo,
    rowVolume24h,
  } = await import("@/lib/majors-filter");

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
    const market = (pv.market || {}) as Record<string, unknown>;
    let mint = pv.mint ? String(pv.mint) : null;
    // Normalize SOL
    if (
      assetId === "solana" ||
      String(a.symbol || "").toUpperCase() === "SOL"
    ) {
      mint = WSOL;
    }
    const coinId = cm.coinId
      ? String(cm.coinId)
      : assetId === "solana"
        ? "solana"
        : null;

    const fallback =
      num(market.price) ?? num(stats.price) ?? num(cm.price) ?? 0;

    if (!(fallback > 0) && !mint && !coinId) continue;

    const ch1 =
      num(market.priceChange1hPercent) ??
      num(stats.priceChange1hPercent) ??
      null;

    out.push({
      assetId,
      symbol: rowSymbol(row as never) || String(a.symbol || ""),
      name: rowName(row as never) || assetId,
      logo: rowLogo(row as never),
      mint,
      coinId,
      fallbackPrice: fallback,
      volume24h:
        num(market.volume24hUSD) ??
        rowVolume24h(row as never) ??
        num(stats.volume24hUSD) ??
        0,
      txyzChange1h: ch1,
    });
  }
  return out;
}

/** Resolve live USD for each major. */
export async function priceMajorsLive(
  hints?: PriceHint[]
): Promise<PricedMajor[]> {
  const universe = hints || (await fetchMajorsUniverse());
  const mints = universe.map((u) => u.mint).filter(Boolean) as string[];
  const coinIds = universe.map((u) => u.coinId).filter(Boolean) as string[];

  const [jup, dex, cg] = await Promise.all([
    fetchJupiterUsd(mints),
    fetchDexScreenerUsd(mints),
    fetchCoinGeckoUsd(coinIds),
  ]);

  return universe
    .map((u) => {
      const mint = u.mint ? normMint(u.mint) : null;
      const ref = u.fallbackPrice > 0 ? u.fallbackPrice : null;
      const candidates: Array<{
        price: number;
        source: PricedMajor["source"];
      }> = [];

      // Prefer Jup → CG → Dex (dex last — flaky pairs) → txyz
      if (mint && jup.has(mint)) {
        candidates.push({ price: jup.get(mint)!, source: "jupiter" });
      }
      if (u.coinId && cg.has(u.coinId)) {
        candidates.push({ price: cg.get(u.coinId)!, source: "coingecko" });
      }
      if (mint && dex.has(mint)) {
        candidates.push({ price: dex.get(mint)!, source: "dexscreener" });
      }
      if (u.fallbackPrice > 0) {
        candidates.push({ price: u.fallbackPrice, source: "tokens.xyz" });
      }

      for (const c of candidates) {
        if (priceSane(c.price, ref ?? candidates[0]?.price)) {
          return { ...u, price: c.price, source: c.source };
        }
      }
      const any = candidates.find((c) => c.price > 0);
      if (any) return { ...u, price: any.price, source: any.source };
      return { ...u, price: 0, source: "tokens.xyz" as const };
    })
    .filter((m) => m.price > 0);
}

/**
 * Price any Tokens.xyz asset id (not just majors) for play / lazy open snap.
 */
export async function priceAssetById(
  assetId: string
): Promise<PricedMajor | null> {
  const id = assetId.trim();
  if (!id) return null;

  try {
    const uni = await fetchMajorsUniverse();
    const hit = uni.find((u) => u.assetId === id);
    if (hit) {
      const priced = await priceMajorsLive([hit]);
      return priced[0] || null;
    }
  } catch {
    /* fall through */
  }

  try {
    const data = await apiFetch(`/assets/${encodeURIComponent(id)}`);
    const a = (data?.asset || data) as Record<string, unknown>;
    const stats = (a.stats || {}) as Record<string, unknown>;
    const cm = (a.canonicalMarket || {}) as Record<string, unknown>;
    const pv = (a.primaryVariant || {}) as Record<string, unknown>;
    const market = (pv.market || {}) as Record<string, unknown>;
    const mint = pv.mint ? String(pv.mint) : null;
    const coinId = cm.coinId ? String(cm.coinId) : null;
    const fallback =
      num(market.price) ?? num(stats.price) ?? num(cm.price) ?? 0;
    const hint: PriceHint = {
      assetId: id,
      symbol: String(a.symbol || pv.symbol || ""),
      name: String(a.name || pv.name || a.symbol || id),
      logo: String(
        a.imageUrl ||
          (market.logoURI as string) ||
          (a as { logo?: string }).logo ||
          ""
      ),
      mint,
      coinId,
      fallbackPrice: fallback,
      volume24h: num(market.volume24hUSD) ?? num(stats.volume24hUSD) ?? 0,
      txyzChange1h:
        num(market.priceChange1hPercent) ??
        num(stats.priceChange1hPercent) ??
        null,
    };
    const priced = await priceMajorsLive([hint]);
    return priced[0] || null;
  } catch {
    return null;
  }
}
