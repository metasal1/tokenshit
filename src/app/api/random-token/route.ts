import { apiFetch } from "@/lib/api";

let cachedIds: string[] = [];
let cacheTime = 0;

export async function GET() {
  try {
    if (Date.now() - cacheTime > 60000 || cachedIds.length === 0) {
      const data = await apiFetch("/assets/curated?list=majors&groupBy=asset");
      const assets = data?.results || data?.assets || data?.data || [];
      cachedIds = assets.map((a: Record<string, unknown>) => {
        const asset = (a.asset || a) as Record<string, unknown>;
        return (asset.id || asset.assetId || a.id || a.assetId) as string;
      }).filter(Boolean);
      cacheTime = Date.now();
    }

    const assetId = cachedIds[Math.floor(Math.random() * cachedIds.length)];
    return Response.json({ assetId });
  } catch {
    return Response.json({ assetId: null });
  }
}
