import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const include = request.nextUrl.searchParams.get("include") || "profile,risk,ohlcv,markets";
  try {
    const data = await apiFetch(`/assets/${encodeURIComponent(assetId)}?include=${include}`);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
