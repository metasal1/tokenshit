import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const sp = request.nextUrl.searchParams;
  const mint = sp.get("mint") || "";
  const limit = sp.get("limit") || "10";
  const qs = new URLSearchParams();
  if (mint) qs.set("mint", mint);
  qs.set("limit", limit);
  try {
    const data = await apiFetch(`/assets/${encodeURIComponent(assetId)}/markets?${qs}`);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
