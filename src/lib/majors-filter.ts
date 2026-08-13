/**
 * Tokens.xyz `list=majors` includes ~1.4k tier3 dust rows.
 * "Real majors" = tier1/tier2 or mcap >= $50M.
 */

export type TrustishRow = {
  assetId?: string;
  id?: string;
  symbol?: string;
  category?: string;
  stats?: {
    marketCap?: number | null;
    volume24hUSD?: number | null;
    price?: number | null;
  };
  primaryVariant?: {
    trustTier?: string | null;
    name?: string | null;
    symbol?: string | null;
    market?: { logoURI?: string; price?: number; marketCap?: number };
  } | null;
  asset?: TrustishRow | null;
  name?: string;
  imageUrl?: string;
  [key: string]: unknown;
};

const MAJORS_MCAP_FLOOR = 50_000_000;

export function rowTrustTier(row: TrustishRow): string {
  const a = row.asset || row;
  const pv = a.primaryVariant || row.primaryVariant || {};
  return String(pv.trustTier || "").toLowerCase();
}

export function rowMarketCap(row: TrustishRow): number {
  const a = row.asset || row;
  const mc =
    a.stats?.marketCap ??
    row.stats?.marketCap ??
    a.primaryVariant?.market?.marketCap;
  return typeof mc === "number" && Number.isFinite(mc) ? mc : 0;
}

export function rowVolume24h(row: TrustishRow): number {
  const a = row.asset || row;
  const v = a.stats?.volume24hUSD ?? row.stats?.volume24hUSD;
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function rowPrice(row: TrustishRow): number | null {
  const a = row.asset || row;
  const p =
    a.stats?.price ??
    row.stats?.price ??
    a.primaryVariant?.market?.price;
  return typeof p === "number" && Number.isFinite(p) && p > 0 ? p : null;
}

export function rowAssetId(row: TrustishRow): string {
  const a = row.asset || row;
  return String(a.assetId || a.id || row.assetId || row.id || "");
}

export function rowName(row: TrustishRow): string {
  const a = row.asset || row;
  const pv = a.primaryVariant || {};
  return String(a.name || row.name || pv.name || pv.symbol || "").trim();
}

export function rowSymbol(row: TrustishRow): string {
  const a = row.asset || row;
  const pv = a.primaryVariant || {};
  return String(a.symbol || row.symbol || pv.symbol || pv.name || "").trim();
}

export function rowLogo(row: TrustishRow): string {
  const a = row.asset || row;
  const pv = a.primaryVariant || {};
  return String(
    a.imageUrl || row.imageUrl || pv.market?.logoURI || ""
  ).trim();
}

export function isRealMajor(row: TrustishRow): boolean {
  const t = rowTrustTier(row);
  if (t === "tier1" || t === "tier2") return true;
  if (rowMarketCap(row) >= MAJORS_MCAP_FLOOR) return true;
  return false;
}

export function filterRealMajors<T extends TrustishRow>(rows: T[]): T[] {
  return rows.filter(isRealMajor);
}
