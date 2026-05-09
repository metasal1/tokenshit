import { apiFetch } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: Record<string, number> | null = null;
let cacheTime = 0;

async function countOne(key: string): Promise<[string, number]> {
  try {
    const data = await apiFetch(`/assets/curated?list=${key}&groupBy=asset`);
    const assets = data?.assets || data?.results || data?.items || [];
    return [key, Array.isArray(assets) ? assets.length : 0];
  } catch {
    return [key, 0];
  }
}

export async function GET() {
  if (cache && Date.now() - cacheTime < CACHE_TTL_MS) {
    return Response.json(cache);
  }
  const entries = await Promise.all(CATEGORIES.map((c) => countOne(c.key)));
  cache = Object.fromEntries(entries);
  cacheTime = Date.now();
  return Response.json(cache);
}
