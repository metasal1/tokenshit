import { apiFetch } from "@/lib/api";

const SPICY_IDS = [
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
  "tron",
  "sui",
  "near",
  "uniswap",
  "aave",
];

let cachedIds: string[] = [];
let cacheTime = 0;

export async function GET() {
  try {
    if (Date.now() - cacheTime > 60000 || cachedIds.length === 0) {
      const data = await apiFetch("/assets/curated?list=majors&groupBy=asset");
      const assets = data?.results || data?.assets || data?.data || [];
      cachedIds = assets
        .map((a: Record<string, unknown>) => {
          const asset = (a.asset || a) as Record<string, unknown>;
          return (asset.id || asset.assetId || a.id || a.assetId) as string;
        })
        .filter(Boolean);
      cacheTime = Date.now();
    }

    const spicy = SPICY_IDS.filter((id) => cachedIds.includes(id));
    const pool = spicy.length >= 5 ? spicy : cachedIds;
    const assetId = pool[Math.floor(Math.random() * pool.length)];
    return Response.json({ assetId });
  } catch {
    return Response.json({ assetId: null });
  }
}
