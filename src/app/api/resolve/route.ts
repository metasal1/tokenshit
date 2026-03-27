import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref") || "";
  const mint = request.nextUrl.searchParams.get("mint") || "";
  const params = new URLSearchParams();
  if (ref) params.set("ref", ref);
  if (mint) params.set("mint", mint);
  try {
    const data = await apiFetch(`/assets/resolve?${params}`);
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
