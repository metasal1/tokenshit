/**
 * Pyth Network prices via public Hermes API.
 * https://hermes.pyth.network — primary live USD for hour game.
 *
 * Tokens.xyz remains universe/meta SOT; Pyth is price truth when available.
 */
const HERMES = "https://hermes.pyth.network";

function pythHeaders(): Record<string, string> {
  const key =
    process.env.PYTH_API_KEY ||
    process.env.PYTH_HERMES_API_KEY ||
    process.env.HERMES_API_KEY ||
    "";
  const h: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "tokenshit-hour-game/pyth-1.1",
  };
  if (key) h.Authorization = `Bearer ${key}`;
  return h;
}


/** Well-known Crypto BASE/USD feed IDs (hex, no 0x) — seed map, rest discovered. */
export const PYTH_SEED_FEEDS: Record<string, string> = {
  SOL: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  BTC: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETH: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
};

type FeedAttr = {
  asset_type?: string;
  base?: string;
  quote_currency?: string;
  display_symbol?: string;
  symbol?: string;
  description?: string;
};

let feedCache: { at: number; byBase: Map<string, string> } | null = null;
const FEED_TTL_MS = 6 * 60 * 60 * 1000;

function normSym(s: string): string {
  return s.trim().toUpperCase().replace(/^\$/, "");
}

function parsePythPrice(price: string | number, expo: number): number {
  const p = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(p)) return 0;
  return p * Math.pow(10, expo);
}

function isPlainUsdPair(a: FeedAttr, base: string): boolean {
  const display = String(a.display_symbol || "");
  const symbol = String(a.symbol || "");
  return (
    display === `${base}/USD` ||
    symbol === `Crypto.${base}/USD` ||
    symbol.endsWith(`.${base}/USD`)
  );
}

/**
 * Discover Crypto BASE/USD feed IDs from Hermes (cached 6h).
 */
export async function getPythUsdFeedMap(): Promise<Map<string, string>> {
  if (feedCache && Date.now() - feedCache.at < FEED_TTL_MS) {
    return new Map(feedCache.byBase);
  }
  const byBase = new Map<string, string>();
  for (const [s, id] of Object.entries(PYTH_SEED_FEEDS)) {
    byBase.set(normSym(s), id.replace(/^0x/, ""));
  }

  try {
    const res = await fetch(`${HERMES}/v2/price_feeds?asset_type=crypto`, {
      headers: pythHeaders(),
      cache: "no-store",
    });
    if (res.ok) {
      const feeds = (await res.json()) as Array<{
        id: string;
        attributes?: FeedAttr;
      }>;
      for (const f of feeds) {
        const a = f.attributes || {};
        const quote = String(a.quote_currency || "").toUpperCase();
        if (quote && quote !== "USD") continue;
        const base = normSym(a.base || "");
        if (!base || base.length > 12) continue;
        const id = String(f.id || "").replace(/^0x/, "");
        if (!id) continue;
        const plain = isPlainUsdPair(a, base);
        if (!byBase.has(base)) {
          if (plain) byBase.set(base, id);
        } else if (plain) {
          byBase.set(base, id);
        }
      }
    }
  } catch {
    /* keep seeds */
  }

  // Targeted lookups for common majors
  for (const q of [
    "sui",
    "bnb",
    "avax",
    "near",
    "aave",
    "uni",
    "link",
    "doge",
    "pepe",
    "jup",
    "jito",
    "render",
    "inj",
    "tia",
    "sei",
    "apt",
    "op",
    "arb",
    "pol",
    "atom",
    "dot",
    "ltc",
    "xrp",
    "ton",
    "trx",
    "ada",
    "hype",
    "tao",
    "zec",
    "ena",
    "wif",
    "bonk",
    "pyth",
    "msol",
    "jitosol",
    "wbtc",
  ]) {
    const want = normSym(q);
    if (byBase.has(want)) continue;
    try {
      const res = await fetch(
        `${HERMES}/v2/price_feeds?query=${encodeURIComponent(q)}&asset_type=crypto`,
        {
          headers: pythHeaders(),
          cache: "no-store",
        }
      );
      if (!res.ok) continue;
      const feeds = (await res.json()) as Array<{
        id: string;
        attributes?: FeedAttr;
      }>;
      for (const f of feeds) {
        const a = f.attributes || {};
        const base = normSym(a.base || "");
        const quote = String(a.quote_currency || "USD").toUpperCase();
        if (quote !== "USD") continue;
        if (base !== want) continue;
        if (!isPlainUsdPair(a, base) && String(a.display_symbol || "") !== `${base}/USD`) {
          // still accept exact base match with USD quote if display is BASE/USD-like
          const d = String(a.display_symbol || "");
          if (d && d !== `${base}/USD`) continue;
        }
        byBase.set(base, String(f.id).replace(/^0x/, ""));
        break;
      }
    } catch {
      /* */
    }
  }

  feedCache = { at: Date.now(), byBase };
  return new Map(byBase);
}

/**
 * Latest USD prices for symbols via Pyth Hermes.
 * Returns map keyed by UPPER symbol.
 */
export async function fetchPythUsdBySymbols(
  symbols: string[]
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const uniq = [...new Set(symbols.map(normSym).filter(Boolean))];
  if (!uniq.length) return out;

  const feeds = await getPythUsdFeedMap();
  const ids: string[] = [];
  const idToSym = new Map<string, string>();
  for (const s of uniq) {
    const id = feeds.get(s);
    if (!id) continue;
    ids.push(id);
    idToSym.set(id, s);
    idToSym.set(id.toLowerCase(), s);
  }
  if (!ids.length) return out;

  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const qs = chunk.map((id) => `ids[]=${encodeURIComponent(id)}`).join("&");
    try {
      const url = `${HERMES}/v2/updates/price/latest?${qs}&parsed=true`;
      const res = await fetch(url, {
        headers: pythHeaders(),
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as {
          parsed?: Array<{
            id?: string;
            price?: { price?: string; expo?: number };
          }>;
        };
        for (const row of data.parsed || []) {
          const id = String(row.id || "").replace(/^0x/, "");
          const sym = idToSym.get(id) || idToSym.get(id.toLowerCase());
          if (!sym || !row.price) continue;
          const px = parsePythPrice(
            row.price.price || "0",
            Number(row.price.expo || 0)
          );
          if (px > 0) out.set(sym, px);
        }
        continue;
      }
    } catch {
      /* try legacy */
    }
    try {
      const qs2 = chunk.map((id) => `ids[]=${id}`).join("&");
      const res = await fetch(`${HERMES}/api/latest_price_feeds?${qs2}`, {
        headers: pythHeaders(),
        cache: "no-store",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as Array<{
        id?: string;
        price?: { price?: string; expo?: number };
      }>;
      for (const row of data || []) {
        const id = String(row.id || "").replace(/^0x/, "");
        const sym = idToSym.get(id) || idToSym.get(id.toLowerCase());
        if (!sym || !row.price) continue;
        const px = parsePythPrice(
          row.price.price || "0",
          Number(row.price.expo || 0)
        );
        if (px > 0) out.set(sym, px);
      }
    } catch {
      /* */
    }
  }
  return out;
}

/** Core board symbols we always want on the hour game. */
export const HOUR_BOARD_SYMBOLS = [
  "SOL",
  "BTC",
  "ETH",
  "BNB",
  "AVAX",
  "SUI",
  "NEAR",
  "AAVE",
  "UNI",
  "LINK",
  "DOGE",
  "WIF",
  "JUP",
  "JTO",
  "RENDER",
  "INJ",
  "TIA",
  "SEI",
  "APT",
  "OP",
  "ARB",
  "POL",
  "ATOM",
  "DOT",
  "LTC",
  "XRP",
  "TON",
  "TRX",
  "ADA",
  "HYPE",
  "TAO",
  "ZEC",
  "ENA",
  "PEPE",
  "BONK",
  "PYTH",
  "MSOL",
  "JITOSOL",
] as const;
