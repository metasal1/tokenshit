import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const params = new URLSearchParams();
  for (const key of [
    "limit",
    "source",
    "tweet_reserve",
    "coin_id",
    "symbol",
    "name",
    "asset_id",
    "terms",
    "term",
  ]) {
    const v = sp.get(key);
    if (v) params.set(key, v);
  }
  if (!params.has("limit")) params.set("limit", "8");
  if (!params.has("source")) params.set("source", "news");

  try {
    const data = await apiFetch(`/news/feed?${params.toString()}`);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: String(e), items: [] }, { status: 200 });
  }
}
