import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const kind = request.nextUrl.searchParams.get("kind") || "";
  const qs = new URLSearchParams();
  if (kind) qs.set("kind", kind);
  try {
    const data = await apiFetch(`/assets/${encodeURIComponent(assetId)}/variants?${qs}`);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
