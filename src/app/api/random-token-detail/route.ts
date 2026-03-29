import { apiFetch } from "@/lib/api";

let cachedAssets: { assetId: string; name: string; symbol: string; logo: string }[] = [];
let cacheTime = 0;

export async function GET() {
  try {
    if (Date.now() - cacheTime > 60000 || cachedAssets.length === 0) {
      const data = await apiFetch("/assets/curated?list=majors&groupBy=asset");
      const assets = data?.results || data?.assets || data?.data || [];
      cachedAssets = assets.map((a: Record<string, unknown>) => {
        const asset = (a.asset || a) as Record<string, unknown>;
        const stats = (asset.stats || {}) as Record<string, unknown>;
        const pv = (asset.primaryVariant || {}) as Record<string, unknown>;
        const market = (pv.market || {}) as Record<string, unknown>;
        return {
          assetId: (asset.id || asset.assetId || a.id || a.assetId) as string,
          name: (asset.name || "Unknown") as string,
          symbol: (asset.symbol || "") as string,
          logo: (asset.imageUrl || market.logoURI || "") as string,
        };
      }).filter((a: { assetId: string }) => a.assetId);
      cacheTime = Date.now();
    }

    const token = cachedAssets[Math.floor(Math.random() * cachedAssets.length)];
    return Response.json(token || { assetId: null });
  } catch {
    return Response.json({ assetId: null });
  }
}
