import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const sp = request.nextUrl.searchParams;
  const mint = sp.get("mint") || "";
  const interval = sp.get("interval") || "1H";
  const from = sp.get("from") || "";
  const to = sp.get("to") || "";
  const qs = new URLSearchParams();
  if (mint) qs.set("mint", mint);
  qs.set("interval", interval);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  try {
    const data = await apiFetch(`/assets/${encodeURIComponent(assetId)}/ohlcv?${qs}`);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
