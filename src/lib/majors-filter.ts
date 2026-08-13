/**
 * Tokens.xyz `list=majors` currently returns ~1500 rows, mostly tier3 dust.
 * Real majors are tier1/tier2 (historically ~30). Keep a soft mcap floor so
 * large tier3 names still appear without flooding the arena/ticker.
 */

export type TrustishRow = {
  assetId?: string;
  id?: string;
  symbol?: string;
  category?: string;
  stats?: { marketCap?: number | null };
  primaryVariant?: { trustTier?: string | null } | null;
  asset?: TrustishRow | null;
  [key: string]: unknown;
};

const MAJORS_MCAP_FLOOR = 50_000_000; // $50M

export function rowTrustTier(row: TrustishRow): string {
  const a = row.asset || row;
  const pv = (a.primaryVariant || row.primaryVariant || {}) as {
    trustTier?: string | null;
  };
  return String(pv.trustTier || "").toLowerCase();
}

export function rowMarketCap(row: TrustishRow): number {
  const a = row.asset || row;
  const mc = a.stats?.marketCap ?? row.stats?.marketCap;
  return typeof mc === "number" && Number.isFinite(mc) ? mc : 0;
}

export function rowAssetId(row: TrustishRow): string {
  const a = row.asset || row;
  return String(a.assetId || a.id || row.assetId || row.id || "");
}

/** Keep quality majors only (tier1/2 or meaningful mcap). */
export function isQualityMajor(row: TrustishRow): boolean {
  const t = rowTrustTier(row);
  if (t === "tier1" || t === "tier2") return true;
  // Some solid names mis-tagged tier3 — keep if market cap is real
  if (rowMarketCap(row) >= MAJORS_MCAP_FLOOR) return true;
  return false;
}

export function filterMajorsList<T extends TrustishRow>(rows: T[]): T[] {
  return rows.filter(isQualityMajor);
}
