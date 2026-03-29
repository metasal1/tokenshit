import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

let cachedIds: string[] = [];
let cacheTime = 0;

export async function GET(request: NextRequest) {
  const assetId = request.nextUrl.searchParams.get("assetId");
  if (!assetId) {
    return Response.json({ error: "Missing assetId" }, { status: 400 });
  }

  try {
    if (Date.now() - cacheTime > 60000 || cachedIds.length === 0) {
      const data = await apiFetch("/assets/curated?list=majors&groupBy=asset");
      const assets = data?.results || data?.assets || data?.data || [];
      // Extract asset IDs - try multiple field names
      cachedIds = assets.map((a: Record<string, unknown>) => {
        const asset = (a.asset || a) as Record<string, unknown>;
        return (asset.id || asset.assetId || a.id || a.assetId) as string;
      }).filter(Boolean);
      cacheTime = Date.now();
    }

    const idx = cachedIds.indexOf(assetId);
    const prev = idx > 0 ? cachedIds[idx - 1] : null;
    const next = idx >= 0 && idx < cachedIds.length - 1 ? cachedIds[idx + 1] : null;

    return Response.json({ prev, next, debug: { total: cachedIds.length, idx } });
  } catch (e) {
    return Response.json({ prev: null, next: null, error: String(e) });
  }
}
