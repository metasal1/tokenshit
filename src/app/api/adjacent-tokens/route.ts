import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

// Cache the majors list for 60s to avoid hammering the API
let cachedMajors: string[] = [];
let cacheTime = 0;

export async function GET(request: NextRequest) {
  const assetId = request.nextUrl.searchParams.get("assetId");
  if (!assetId) {
    return Response.json({ error: "Missing assetId" }, { status: 400 });
  }

  try {
    // Refresh cache if stale
    if (Date.now() - cacheTime > 60000 || cachedMajors.length === 0) {
      const data = await apiFetch("/assets?limit=50&sort=-marketCap");
      const assets = data?.results || data?.assets || data?.data || [];
      cachedMajors = assets.map((a: Record<string, unknown>) => (a.id || a.assetId) as string);
      cacheTime = Date.now();
    }

    const idx = cachedMajors.indexOf(assetId);
    const prev = idx > 0 ? cachedMajors[idx - 1] : null;
    const next = idx >= 0 && idx < cachedMajors.length - 1 ? cachedMajors[idx + 1] : null;

    return Response.json({ prev, next });
  } catch {
    return Response.json({ prev: null, next: null });
  }
}
