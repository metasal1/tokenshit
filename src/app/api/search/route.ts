import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const limit = request.nextUrl.searchParams.get("limit") || "20";
  if (!q) return Response.json({ results: [] });
  try {
    const data = await apiFetch(`/assets/search?q=${encodeURIComponent(q)}&limit=${limit}`);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
