import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(request: NextRequest) {
  const list = request.nextUrl.searchParams.get("list") || "majors";
  const groupBy = request.nextUrl.searchParams.get("groupBy") || "asset";
  try {
    const data = await apiFetch(
      `/assets/curated?list=${encodeURIComponent(list)}&groupBy=${groupBy}`
    );
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
