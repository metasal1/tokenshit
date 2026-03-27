export interface Asset {
  assetId: string;
  name: string;
  symbol: string;
  slug?: string;
  logo?: string;
  description?: string;
  profile?: AssetProfile;
  risk?: RiskSummary;
  ohlcv?: OhlcvData[];
  markets?: Market[];
}

export interface AssetProfile {
  name: string;
  symbol: string;
  logo?: string;
  description?: string;
  website?: string;
  twitter?: string;
  tags?: string[];
}

export interface RiskSummary {
  score?: number;
  level?: string;
  flags?: string[];
}

export interface RiskDetails {
  score?: number;
  level?: string;
  factors?: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  score: number;
  level: string;
  description?: string;
}

export interface OhlcvData {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface Market {
  poolAddress?: string;
  dexName?: string;
  baseMint?: string;
  quoteMint?: string;
  baseSymbol?: string;
  quoteSymbol?: string;
  price?: number;
  volume24h?: number;
  liquidity?: number;
  fdv?: number;
  marketCap?: number;
  priceChange24h?: number;
  priceChange1h?: number;
}

export interface SearchResult {
  assetId: string;
  name: string;
  symbol: string;
  logo?: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
}

export interface MarketSnapshot {
  mint: string;
  price?: number;
  priceChange24h?: number;
  priceChange1h?: number;
  marketCap?: number;
  volume24h?: number;
  liquidity?: number;
  fdv?: number;
}

export interface Variant {
  mint: string;
  kind: string;
  name?: string;
  symbol?: string;
  trustTier?: string;
  chain?: string;
}
