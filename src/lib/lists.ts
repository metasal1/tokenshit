/** Foundation Tokens.xyz curated list ids + UI labels */
export const CURATED_LISTS = [
  { key: "majors", label: "Crypto", short: "Crypto" },
  { key: "lsts", label: "Staking", short: "LSTs" },
  { key: "currencies", label: "Stables", short: "FX" },
  { key: "rwas", label: "Treasuries", short: "RWA" },
  { key: "stocks", label: "Stocks", short: "Stocks" },
  { key: "metals", label: "Metals", short: "Metals" },
  { key: "etfs", label: "ETFs", short: "ETFs" },
] as const;

export type CuratedListKey = (typeof CURATED_LISTS)[number]["key"];

export const ARENA_TABS = [
  { key: "all", label: "All" },
  { key: "majors", label: "Crypto" },
  { key: "stocks", label: "Stocks" },
  { key: "currencies", label: "Stables" },
  { key: "rwas", label: "RWA" },
  { key: "lsts", label: "Staking" },
  { key: "etfs", label: "ETFs" },
  { key: "metals", label: "Metals" },
] as const;

export function isSolanaMint(q: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q.trim());
}
