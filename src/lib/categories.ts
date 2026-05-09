export interface Category {
  key: string;
  label: string;
  description: string;
  navLabel?: string; // shorter label for nav
}

export const CATEGORIES: Category[] = [
  { key: "majors",     label: "Tokens",     navLabel: "Tokens",     description: "Major crypto tokens — the heavyweights of the chain." },
  { key: "stocks",     label: "Stocks",     navLabel: "Stocks",     description: "Tokenized stocks tracking equity prices on-chain." },
  { key: "etfs",       label: "ETFs",       navLabel: "ETFs",       description: "Tokenized exchange-traded funds." },
  { key: "rwas",       label: "RWAs",       navLabel: "RWAs",       description: "Real-world assets brought on-chain." },
  { key: "currencies", label: "Currencies", navLabel: "Currencies", description: "Stablecoins and currency-pegged tokens." },
  { key: "metals",     label: "Metals",     navLabel: "Metals",     description: "Gold, silver, and other precious-metal-backed tokens." },
  { key: "lsts",       label: "LSTs",       navLabel: "LSTs",       description: "Liquid staking tokens." },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

export function getCategory(key: string): Category | null {
  return CATEGORIES.find((c) => c.key === key) ?? null;
}
