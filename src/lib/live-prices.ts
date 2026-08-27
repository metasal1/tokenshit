/**
 * Multi-source live USD prices for the hour game.
 *
 * Universe / metadata: Tokens.xyz curated majors (+ board symbol backfill)
 * PRICE TRUTH (priority):
 *   1. Pyth Hermes (oracle, low latency)
 *   2. Jupiter
 *   3. CoinGecko
 *   4. DexScreener
 *   5. Tokens.xyz market (last — often stale 1h)
 */
import { apiFetch } from "@/lib/api";
import { orbLogo } from "@/lib/asset-logos";
import {
  fetchPythUsdBySymbols,
  HOUR_BOARD_SYMBOLS,
} from "@/lib/pyth-prices";

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
  source: "pyth" | "tokens.xyz" | "jupiter" | "dexscreener" | "coingecko";
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

/** True if candidate is within a sensible band of Tokens.xyz reference. */
function priceSane(candidate: number, ref: number | null | undefined): boolean {
  if (!(candidate > 0) || !Number.isFinite(candidate)) return false;
  if (!(ref && ref > 0)) return true;
  const r = candidate / ref;
  // Allow up to ~±60% vs txyz; reject inverted/micro pair bugs
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
        "User-Agent": "tokenshit-hour-game/1.2",
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
          "User-Agent": "tokenshit-hour-game/1.2",
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
        "User-Agent": "tokenshit-hour-game/1.2",
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

/** Universe from Tokens.xyz **majors** (~31). Stocks/mega are off the Play board. */
export function playUniverseList(): string {
  return (
    process.env.PLAY_MAJORS_LIST?.trim() ||
    process.env.TOKENS_XYZ_MAJORS_LIST?.trim() ||
    "majors"
  );
}

export async function fetchMajorsUniverse(): Promise<PriceHint[]> {
  // short in-memory cache — Tokens.xyz list is slow / flaky on Workers
  const g = globalThis as unknown as {
    __tsMajorsUni?: { at: number; val: PriceHint[] };
  };
  if (g.__tsMajorsUni && Date.now() - g.__tsMajorsUni.at < 10 * 60_000) {
    return g.__tsMajorsUni.val;
  }

  const list = playUniverseList();

  let data: Record<string, unknown> | null = null;
  try {
    data = (await Promise.race([
      apiFetch(`/assets/curated?list=${encodeURIComponent(list)}&groupBy=asset`),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error("txyz universe timeout")), 12_000)
      ),
    ])) as Record<string, unknown>;
  } catch {
    data = null;
  }

  const raw = (data?.assets || data?.results || []) as Array<
    Record<string, unknown>
  >;
  const {
    rowAssetId,
    rowName,
    rowSymbol,
    rowLogo,
    rowVolume24h,
  } = await import("@/lib/majors-filter");

  const out: PriceHint[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    const a = ((row as { asset?: Record<string, unknown> }).asset ||
      row) as Record<string, unknown>;
    const assetId = rowAssetId(row as never);
    if (!assetId || seen.has(assetId)) continue;
    const stats = (a.stats || {}) as Record<string, unknown>;
    const cm = (a.canonicalMarket || {}) as Record<string, unknown>;
    const pv = (a.primaryVariant || {}) as Record<string, unknown>;
    const market = (pv.market || {}) as Record<string, unknown>;
    let mint = pv.mint ? String(pv.mint) : null;
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

    const ch1 =
      num(market.priceChange1hPercent) ??
      num(stats.priceChange1hPercent) ??
      null;

    const symbol = rowSymbol(row as never) || String(a.symbol || "");
    const logo = rowLogo(row as never);
    seen.add(assetId);
    out.push({
      assetId,
      symbol,
      name: rowName(row as never) || assetId,
      logo: orbLogo(mint, symbol) || logo || "",
      mint,
      coinId,
      fallbackPrice: fallback > 0 ? fallback : 0,
      volume24h:
        num(market.volume24hUSD) ??
        rowVolume24h(row as never) ??
        num(stats.volume24hUSD) ??
        0,
      txyzChange1h: ch1,
    });
  }

  if (out.length) {
    g.__tsMajorsUni = { at: Date.now(), val: out };
  }
  return out;
}

/**
 * Resolve live USD — Pyth first, then Jup/CG/Dex, txyz last.
 * Small majors board: full multi-source OK. Mega is not the Play universe.
 */
export async function priceMajorsLive(
  hints?: PriceHint[]
): Promise<PricedMajor[]> {
  const universe = hints || (await fetchMajorsUniverse());
  const mints = universe.map((u) => u.mint).filter(Boolean) as string[];
  const coinIds = universe.map((u) => u.coinId).filter(Boolean) as string[];
  const symbols = universe.map((u) => u.symbol).filter(Boolean);

  const to = <T,>(p: Promise<T>, ms: number, fb: T) =>
    Promise.race([
      p.catch(() => fb),
      new Promise<T>((r) => setTimeout(() => r(fb), ms)),
    ]);

  const large = universe.length > 80;
  // Full multi-source only for small boards — mega list uses txyz + Pyth
  const boardSyms = large
    ? [...HOUR_BOARD_SYMBOLS]
    : symbols;

  const [pyth, jup, dex, cg] = await Promise.all([
    to(fetchPythUsdBySymbols(boardSyms), 4_000, new Map<string, number>()),
    large
      ? Promise.resolve(new Map<string, number>())
      : to(fetchJupiterUsd(mints), 4_000, new Map<string, number>()),
    large
      ? Promise.resolve(new Map<string, number>())
      : to(fetchDexScreenerUsd(mints), 4_000, new Map<string, number>()),
    large
      ? Promise.resolve(new Map<string, number>())
      : to(fetchCoinGeckoUsd(coinIds), 4_000, new Map<string, number>()),
  ]);

  return universe
    .map((u) => {
      const mint = u.mint ? normMint(u.mint) : null;
      const txyz = u.fallbackPrice > 0 ? u.fallbackPrice : null;
      const sym = (u.symbol || "").toUpperCase();

      const candidates: Array<{
        price: number;
        source: PricedMajor["source"];
      }> = [];

      // 1) Pyth oracle
      if (sym && pyth.has(sym)) {
        candidates.push({ price: pyth.get(sym)!, source: "pyth" });
      }
      // 2) Jupiter
      if (mint && jup.has(mint)) {
        candidates.push({ price: jup.get(mint)!, source: "jupiter" });
      }
      // 3) CoinGecko
      if (u.coinId && cg.has(u.coinId)) {
        candidates.push({ price: cg.get(u.coinId)!, source: "coingecko" });
      }
      // 4) Dex
      if (mint && dex.has(mint)) {
        candidates.push({ price: dex.get(mint)!, source: "dexscreener" });
      }
      // 5) Tokens.xyz last (often stale) — primary for mega list
      if (txyz) {
        candidates.push({ price: txyz, source: "tokens.xyz" });
      }

      // Prefer first sane candidate; pyth skips tight txyz band when txyz flat
      const ref = txyz;
      for (const c of candidates) {
        if (c.source === "pyth" && c.price > 0) {
          // Pyth is oracle — accept unless absurd vs txyz when txyz present
          if (!ref || priceSane(c.price, ref) || Math.abs(c.price - ref) / ref < 0.5) {
            return { ...u, price: c.price, source: c.source };
          }
        }
        if (c.source !== "tokens.xyz" && priceSane(c.price, ref ?? c.price)) {
          return { ...u, price: c.price, source: c.source };
        }
      }
      // last resort any positive
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
