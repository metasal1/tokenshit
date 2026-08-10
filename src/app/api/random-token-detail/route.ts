import { apiFetch } from "@/lib/api";

// Spicy default pool — fun/divisive first, not boring bluechips every spin
const SPICY_IDS = new Set([
  "zora",
  "avalanche-2",
  "bnb",
  "ethereum",
  "hyperliquid",
  "monad",
  "megaeth",
  "delorean",
  "chiliz",
  "paris-saint-germain-fan-token",
  "arsenal-fan-token",
  "bittensor",
  "ethena",
  "lighter",
  "arcium",
  "xmaquina",
  "blend",
  "infinex",
  "billions-network",
  "tron",
  "sui",
  "near",
  "starknet",
  "uniswap",
  "aave",
  "crypto-bpxxfrcx",
  "usd-ai",
]);

let cachedAssets: { assetId: string; name: string; symbol: string; logo: string }[] = [];
let cacheTime = 0;

export async function GET() {
  try {
    if (Date.now() - cacheTime > 60000 || cachedAssets.length === 0) {
      const data = await apiFetch("/assets/curated?list=majors&groupBy=asset");
      const assets = data?.results || data?.assets || data?.data || [];
      cachedAssets = assets
        .map((a: Record<string, unknown>) => {
          const asset = (a.asset || a) as Record<string, unknown>;
          const pv = (asset.primaryVariant || {}) as Record<string, unknown>;
          const market = (pv.market || {}) as Record<string, unknown>;
          return {
            assetId: (asset.id || asset.assetId || a.id || a.assetId) as string,
            name: (asset.name || "Unknown") as string,
            symbol: (asset.symbol || "") as string,
            logo: (asset.imageUrl || market.logoURI || "") as string,
          };
        })
        .filter((a: { assetId: string }) => a.assetId);
      cacheTime = Date.now();
    }

    const spicy = cachedAssets.filter((a) => SPICY_IDS.has(a.assetId));
    const pool = spicy.length >= 5 ? spicy : cachedAssets;
    const token = pool[Math.floor(Math.random() * pool.length)];
    return Response.json(token || { assetId: null });
  } catch {
    return Response.json({ assetId: null });
  }
}
