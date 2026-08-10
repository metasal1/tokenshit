import { type NextRequest } from "next/server";
import { fetchCuratedList } from "@/lib/curatedAssets";

export async function GET(request: NextRequest) {
  const list = request.nextUrl.searchParams.get("list") || "majors";
  try {
    const assets = await fetchCuratedList(list);
    return Response.json({
      listId: list,
      assets,
      count: assets.length,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
