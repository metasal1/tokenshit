/**
 * Durable asset logos for Play bags.
 * Prefer stored Turso cache → known CDN map → empty.
 */
import { tursoExecute } from "@/lib/turso";

let schemaReady = false;

export async function ensureLogoSchema() {
  if (schemaReady) return;
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS asset_logos (
      asset_id TEXT PRIMARY KEY,
      symbol TEXT,
      logo TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  );
  await tursoExecute(
    `CREATE INDEX IF NOT EXISTS idx_asset_logos_symbol ON asset_logos(symbol)`
  );
  schemaReady = true;
}

const SIMPLR =
  "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images";

const WSOL = "So11111111111111111111111111111111111111112";

/** Official on-chain Solana logos via Orb. */
export function orbLogo(
  mint?: string | null,
  symbol?: string | null
): string {
  let m = (mint || "").trim();
  if (!m && (symbol || "").toUpperCase() === "SOL") m = WSOL;
  if (m.length < 32) return "";
  return `https://orbmarkets.io/token/${m}/logo`;
}

/** CoinGecko id → logo via simplr CDN (no rate limit / bandwidth). */
function cg(id: string): string {
  return `${SIMPLR}/${id}/standard.png`;
}

/**
 * Full board + common majors symbol → logo URL.
 * Prefer simplr-sh (16k coins). Spot icons only where simpler.
 */
const KNOWN: Record<string, string> = {
  SOL: cg("solana"),
  BTC: cg("bitcoin"),
  ETH: cg("ethereum"),
  BNB: cg("binancecoin"),
  AVAX: cg("avalanche-2"),
  SUI: cg("sui"),
  NEAR: cg("near"),
  AAVE: cg("aave"),
  UNI: cg("uniswap"),
  LINK: cg("chainlink"),
  DOGE: cg("dogecoin"),
  WIF: cg("dogwifcoin"),
  JUP: cg("jupiter-exchange-solana"),
  JTO: cg("jito-governance-token"),
  RENDER: cg("render-token"),
  RNDR: cg("render-token"),
  INJ: cg("injective-protocol"),
  TIA: cg("celestia"),
  SEI: cg("sei-network"),
  APT: cg("aptos"),
  OP: cg("optimism"),
  ARB: cg("arbitrum"),
  POL: cg("polygon-ecosystem-token"),
  MATIC: cg("matic-network"),
  ATOM: cg("cosmos"),
  DOT: cg("polkadot"),
  LTC: cg("litecoin"),
  XRP: cg("ripple"),
  TON: cg("the-open-network"),
  TRX: cg("tron"),
  ADA: cg("cardano"),
  HYPE: cg("hyperliquid"),
  TAO: cg("bittensor"),
  ZEC: cg("zcash"),
  ENA: cg("ethena"),
  PEPE: cg("pepe"),
  BONK: cg("bonk"),
  PYTH: cg("pyth-network"),
  MSOL: cg("msol"),
  JITOSOL: cg("jito-staked-sol"),
  JitoSOL: cg("jito-staked-sol"),
  W: cg("wormhole"),
  WETH: cg("weth"),
  USDC: cg("usd-coin"),
  USDT: cg("tether"),
  WBTC: cg("wrapped-bitcoin"),
  XSGD: cg("xsgd"),
  STETH: cg("staked-ether"),
  HBAR: cg("hedera-hashgraph"),
  FIL: cg("filecoin"),
  ICP: cg("internet-computer"),
  IMX: cg("immutable-x"),
  MKR: cg("maker"),
  CRV: cg("curve-dao-token"),
  LDO: cg("lido-dao"),
  GRT: cg("the-graph"),
  FET: cg("fetch-ai"),
  ONDO: cg("ondo-finance"),
  S: cg("sonic-3"),
  FARTCOIN: cg("fartcoin"),
  PENGU: cg("pudgy-penguins"),
  TRUMP: cg("official-trump"),
  VIRTUAL: cg("virtual-protocol"),
  AI16Z: cg("ai16z"),
  GOAT: cg("goatseus-maximus"),
  ARX: cg("arcium"),
  BLEND: cg("fluent"),
  FLUENT: cg("fluent"),
};

export function knownLogo(symbol: string | null | undefined): string {
  if (!symbol) return "";
  const s = symbol.toUpperCase().replace(/^\$/, "").trim();
  if (KNOWN[s]) return KNOWN[s]!;
  // case variants already uppercased
  if (s === "JITOSOL") return KNOWN.JITOSOL!;
  return "";
}

/** All known symbol keys (for seeding). */
export function allKnownLogoRows(): Array<{
  assetId: string;
  symbol: string;
  logo: string;
}> {
  return Object.entries(KNOWN).map(([symbol, logo]) => ({
    assetId: symbol.toLowerCase(),
    symbol,
    logo,
  }));
}

export async function upsertAssetLogos(
  rows: Array<{ assetId: string; symbol?: string; logo?: string | null }>
): Promise<void> {
  const clean = rows.filter(
    (r) => r.assetId && r.logo && String(r.logo).startsWith("http")
  );
  if (!clean.length) return;
  await ensureLogoSchema();
  const now = new Date().toISOString();
  // batch inserts (Workers can't do 500 sequential round-trips)
  const chunk = 40;
  for (let i = 0; i < Math.min(clean.length, 500); i += chunk) {
    const part = clean.slice(i, i + chunk);
    const values: Array<string | number | null> = [];
    const ph = part
      .map((r) => {
        values.push(
          r.assetId,
          (r.symbol || "").toUpperCase(),
          String(r.logo),
          now
        );
        return "(?, ?, ?, ?)";
      })
      .join(",");
    await tursoExecute(
      `INSERT INTO asset_logos (asset_id, symbol, logo, updated_at)
       VALUES ${ph}
       ON CONFLICT(asset_id) DO UPDATE SET
         logo = excluded.logo,
         symbol = COALESCE(NULLIF(excluded.symbol, ''), asset_logos.symbol),
         updated_at = excluded.updated_at`,
      values
    );
  }
}

/** Seed board symbols into Turso so open-snap / pyth paths always have logos. */
export async function seedKnownLogos(): Promise<void> {
  await upsertAssetLogos(allKnownLogoRows());
}

export async function loadLogoMaps(opts: {
  assetIds: string[];
  symbols: string[];
}): Promise<{ byId: Map<string, string>; bySym: Map<string, string> }> {
  const byId = new Map<string, string>();
  const bySym = new Map<string, string>();

  // Always load known first so we never show blank for board bags
  for (const [sym, logo] of Object.entries(KNOWN)) {
    bySym.set(sym, logo);
    byId.set(sym.toLowerCase(), logo);
  }

  try {
    await ensureLogoSchema();
    const ids = [...new Set(opts.assetIds.filter(Boolean))].slice(0, 150);
    const syms = [
      ...new Set(opts.symbols.map((s) => s.toUpperCase()).filter(Boolean)),
    ].slice(0, 150);

    if (ids.length) {
      const ph = ids.map(() => "?").join(",");
      const r = await tursoExecute(
        `SELECT asset_id, logo, symbol FROM asset_logos WHERE asset_id IN (${ph})`,
        ids
      );
      for (const row of r.rows) {
        const id = String(row[0] || "");
        const logo = String(row[1] || "");
        const sym = String(row[2] || "").toUpperCase();
        // Prefer non-empty stored (often better txyz/arweave art) over generic
        if (id && logo) byId.set(id, logo);
        if (sym && logo) bySym.set(sym, logo);
      }
    }
    if (syms.length) {
      const ph = syms.map(() => "?").join(",");
      const r = await tursoExecute(
        `SELECT asset_id, logo, symbol FROM asset_logos WHERE upper(symbol) IN (${ph})`,
        syms
      );
      for (const row of r.rows) {
        const id = String(row[0] || "");
        const logo = String(row[1] || "");
        const sym = String(row[2] || "").toUpperCase();
        if (id && logo) byId.set(id, logo);
        if (sym && logo) bySym.set(sym, logo);
      }
    }
  } catch {
    /* turso blip — known map still works */
  }

  // ensure every requested symbol has known fallback
  for (const s of opts.symbols) {
    const u = s.toUpperCase();
    if (!bySym.has(u)) {
      const k = knownLogo(u);
      if (k) bySym.set(u, k);
    }
  }
  return { byId, bySym };
}

export function resolveLogo(
  assetId: string,
  symbol: string,
  current: string | null | undefined,
  maps: { byId: Map<string, string>; bySym: Map<string, string> },
  mint?: string | null
): string {
  const orb = orbLogo(mint, symbol);
  if (orb) return orb;
  if (current && String(current).startsWith("http") && !/jsdelivr|coingecko/i.test(String(current)))
    return String(current);
  const orbFromCurrent = orbLogo(current);
  if (orbFromCurrent) return orbFromCurrent;
  const sym = (symbol || "").toUpperCase();
  return (
    maps.byId.get(assetId) ||
    maps.bySym.get(sym) ||
    maps.byId.get(assetId.toLowerCase()) ||
    maps.byId.get(sym.toLowerCase()) ||
    knownLogo(symbol) ||
    knownLogo(assetId) ||
    ""
  );
}
