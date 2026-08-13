import { apiFetch } from "@/lib/api";
import type { CuratedListKey } from "@/lib/lists";

export interface CuratedAssetItem {
  assetId: string;
  name: string;
  symbol: string;
  logo?: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
  mint?: string;
  kind?: string;
  /** When true, this row is an LST/yield variant under a parent asset */
  isVariant?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCuratedRow(a: any): CuratedAssetItem {
  const asset = a.asset || a;
  return {
    assetId: (asset.assetId || asset.id || a.assetId || a.id || "") as string,
    name: (asset.name || a.name || "Unknown") as string,
    symbol: (asset.symbol || a.symbol || "") as string,
    logo:
      (asset.imageUrl ||
        asset.logo ||
        a.imageUrl ||
        a.primaryVariant?.market?.logoURI ||
        a.logo ||
        undefined) as string | undefined,
    price: (asset.stats?.price ?? a.stats?.price ?? a.price ?? undefined) as
      | number
      | undefined,
    priceChange24h: (asset.stats?.priceChange24hPercent ??
      a.stats?.priceChange24hPercent ??
      a.priceChange24h ??
      undefined) as number | undefined,
    marketCap: (asset.stats?.marketCap ??
      a.stats?.marketCap ??
      a.marketCap ??
      undefined) as number | undefined,
    volume24h: (asset.stats?.volume24hUSD ??
      a.stats?.volume24hUSD ??
      a.volume24h ??
      undefined) as number | undefined,
  };
}

/** Tokens.xyz collapses LSTs to asset=solana — expand yield variants tagged curated:lsts */
export async function fetchCuratedList(
  list: CuratedListKey | string
): Promise<CuratedAssetItem[]> {
  if (list === "lsts") {
    return fetchLstsExpanded();
  }
  const data = await apiFetch(
    `/assets/curated?list=${encodeURIComponent(list)}&groupBy=asset`
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = Array.isArray(data)
    ? data
    : data.assets || data.results || data.items || [];
  return raw.map(mapCuratedRow).filter((a) => a.assetId);
}

async function fetchLstsExpanded(): Promise<CuratedAssetItem[]> {
  try {
    const data = await apiFetch(`/assets/solana/variants`);
    const variants = (data.variants || data.results || []) as Record<
      string,
      unknown
    >[];
    const items: CuratedAssetItem[] = [];
    for (const v of variants) {
      const tags = (v.tags as string[]) || [];
      const kind = String(v.kind || "");
      const isLst =
        tags.includes("curated:lsts") ||
        kind === "yield" ||
        /staked|stake|lst|msol|jito/i.test(String(v.name || ""));
      if (!isLst) continue;
      if (kind === "native") continue;
      const market = (v.market || {}) as Record<string, unknown>;
      const mint = String(v.mint || "");
      const name = String(v.name || "LST");
      const symbol = lstSymbol(name, mint);
      items.push({
        assetId: "solana",
        name,
        symbol,
        logo: (market.logoURI as string) || undefined,
        price: typeof market.price === "number" ? market.price : undefined,
        mint,
        kind,
        isVariant: true,
      });
    }
    // de-dupe by mint
    const seen = new Set<string>();
    const unique = items.filter((i) => {
      const k = i.mint || i.name;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    unique.sort((a, b) => (b.price || 0) - (a.price || 0));
    return unique;
  } catch {
    // fallback collapsed curated
    const data = await apiFetch(`/assets/curated?list=lsts&groupBy=asset`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any[] = Array.isArray(data)
      ? data
      : data.assets || data.results || [];
    return raw.map(mapCuratedRow);
  }
}

function lstSymbol(name: string, mint: string): string {
  const n = name.toLowerCase();
  const table: [RegExp, string][] = [
    [/jito/, "JitoSOL"],
    [/marinade|\(msol\)|msol/, "mSOL"],
    [/jupiter/, "JupSOL"],
    [/bonksol/, "bonkSOL"],
    [/hylo sol plus/, "hyloSOL+"],
    [/hylo/, "hyloSOL"],
    [/phantom/, "pSOL"],
    [/bybit|bbsol/, "bbSOL"],
    [/backpack/, "bpSOL"],
    [/binance|bnsol/, "BNSOL"],
    [/helius/, "hSOL"],
    [/drift/, "dSOL"],
    [/the vault|vsol/, "vSOL"],
    [/laine/, "laineSOL"],
    [/pico/, "picoSOL"],
    [/dyno/, "dynoSOL"],
    [/solayer/, "sSOL"],
    [/blaze|bsol/, "bSOL"],
    [/step/, "stepSOL"],
    [/jupsol/, "JupSOL"],
  ];
  for (const [re, sym] of table) {
    if (re.test(n)) return sym;
  }
  // Camel/compound already in name
  const m = name.match(/\b([A-Za-z]*SOL[+]?)\b/);
  if (m) return m[1];
  if (mint) return `${mint.slice(0, 4)}…`;
  return "LST";
}

/** Build assetId → category map from all curated lists (majors wins on overlap) */
export async function buildAssetCategoryMap(): Promise<
  Record<string, CuratedListKey>
> {
  // Order matters for overlap — first writer wins; put majors first
  const keys: CuratedListKey[] = [
    "majors",
    "stocks",
    "currencies",
    "rwas",
    "etfs",
    "metals",
  ];
  const map: Record<string, CuratedListKey> = {};

  // Sequential so majors always lands before other lists overwrite
  for (const key of keys) {
    try {
      const data = await apiFetch(
        `/assets/curated?list=${key}&groupBy=asset`
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any[] = Array.isArray(data)
        ? data
        : data.assets || data.results || [];
      for (const row of raw) {
        const id = String(row.assetId || row.id || row.asset?.id || "");
        if (id && !map[id]) map[id] = key;
      }
    } catch {
      /* skip */
    }
  }
  // SOL is crypto/majors; LSTs are variants of solana, not a separate asset category
  if (!map["solana"]) map["solana"] = "majors";
  else map["solana"] = "majors";
  return map;
}
