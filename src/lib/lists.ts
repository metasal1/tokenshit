/** Foundation Tokens.xyz curated list ids + UI labels (Noto emoji) */
export const CURATED_LISTS = [
  { key: "majors", label: "Crypto", short: "Crypto", emoji: "🪙" },
  { key: "lsts", label: "Staking", short: "LSTs", emoji: "🥩" },
  { key: "currencies", label: "Stables", short: "FX", emoji: "💵" },
  { key: "rwas", label: "Treasuries", short: "RWA", emoji: "🏦" },
  { key: "stocks", label: "Stocks", short: "Stocks", emoji: "📈" },
  { key: "metals", label: "Metals", short: "Metals", emoji: "🥇" },
  { key: "etfs", label: "ETFs", short: "ETFs", emoji: "📦" },
] as const;

export type CuratedListKey = (typeof CURATED_LISTS)[number]["key"];

export const ARENA_TABS = [
  { key: "all", label: "All", emoji: "🏟️" },
  { key: "majors", label: "Crypto", emoji: "🪙" },
  { key: "stocks", label: "Stocks", emoji: "📈" },
  { key: "currencies", label: "Stables", emoji: "💵" },
  { key: "rwas", label: "RWA", emoji: "🏦" },
  { key: "lsts", label: "Staking", emoji: "🥩" },
  { key: "etfs", label: "ETFs", emoji: "📦" },
  { key: "metals", label: "Metals", emoji: "🥇" },
] as const;

export function isSolanaMint(q: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q.trim());
}
