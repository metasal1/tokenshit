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

/** Well-known symbol → logo (jsDelivr cryptocurrency-icons). */
const KNOWN: Record<string, string> = {
  SOL: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sol.png",
  BTC: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png",
  ETH: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png",
  BNB: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/bnb.png",
  AVAX: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/avax.png",
  SUI: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sui.png",
  NEAR: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/near.png",
  AAVE: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/aave.png",
  UNI: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/uni.png",
  LINK: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/link.png",
  DOGE: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/doge.png",
  JUP: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/jup.png",
  RENDER: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/rndr.png",
  INJ: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/inj.png",
  TIA: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/tia.png",
  SEI: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sei.png",
  APT: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/apt.png",
  OP: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/op.png",
  ARB: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/arb.png",
  ATOM: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/atom.png",
  DOT: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/dot.png",
  LTC: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/ltc.png",
  XRP: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/xrp.png",
  TON: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/ton.png",
  TRX: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/trx.png",
  ADA: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/ada.png",
  PEPE: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/pepe.png",
  BONK: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/bonk.png",
  PYTH: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/pyth.png",
  MSOL: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/msol.png",
  WIF: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/wif.png",
  POL: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/matic.png",
  JTO: "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/jto.png",
};

export function knownLogo(symbol: string | null | undefined): string {
  if (!symbol) return "";
  const s = symbol.toUpperCase().replace(/^\$/, "");
  return KNOWN[s] || "";
}

export async function upsertAssetLogos(
  rows: Array<{ assetId: string; symbol?: string; logo?: string | null }>
): Promise<void> {
  const clean = rows.filter((r) => r.assetId && r.logo && String(r.logo).startsWith("http"));
  if (!clean.length) return;
  await ensureLogoSchema();
  const now = new Date().toISOString();
  // batch small
  for (const r of clean.slice(0, 80)) {
    await tursoExecute(
      `INSERT INTO asset_logos (asset_id, symbol, logo, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(asset_id) DO UPDATE SET
         logo = excluded.logo,
         symbol = COALESCE(excluded.symbol, asset_logos.symbol),
         updated_at = excluded.updated_at`,
      [r.assetId, (r.symbol || "").toUpperCase(), String(r.logo), now]
    );
  }
}

export async function loadLogoMaps(opts: {
  assetIds: string[];
  symbols: string[];
}): Promise<{ byId: Map<string, string>; bySym: Map<string, string> }> {
  const byId = new Map<string, string>();
  const bySym = new Map<string, string>();
  try {
    await ensureLogoSchema();
    const ids = [...new Set(opts.assetIds.filter(Boolean))].slice(0, 120);
    const syms = [
      ...new Set(opts.symbols.map((s) => s.toUpperCase()).filter(Boolean)),
    ].slice(0, 120);

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
        if (id && logo && !byId.has(id)) byId.set(id, logo);
        if (sym && logo) bySym.set(sym, logo);
      }
    }
  } catch {
    /* turso blip */
  }

  // fill known
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
  maps: { byId: Map<string, string>; bySym: Map<string, string> }
): string {
  if (current && String(current).startsWith("http")) return String(current);
  return (
    maps.byId.get(assetId) ||
    maps.bySym.get((symbol || "").toUpperCase()) ||
    knownLogo(symbol) ||
    ""
  );
}
