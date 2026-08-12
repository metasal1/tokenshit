import { type NextRequest } from "next/server";
import { getOrderedIds } from "@/lib/random-pool";

export const dynamic = "force-dynamic";

/**
 * Prev/next across full curated pool (all categories), not majors-only.
 */
export async function GET(request: NextRequest) {
  const assetId = request.nextUrl.searchParams.get("assetId");
  if (!assetId) {
    return Response.json({ error: "Missing assetId" }, { status: 400 });
  }

  try {
    const ids = await getOrderedIds();
    const idx = ids.indexOf(assetId);
    const prev = idx > 0 ? ids[idx - 1] : null;
    const next =
      idx >= 0 && idx < ids.length - 1
        ? ids[idx + 1]
        : idx < 0 && ids.length
          ? ids[0]
          : null;

    return Response.json(
      {
        prev,
        next,
        total: ids.length,
        idx,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (e) {
    return Response.json({ prev: null, next: null, error: String(e) });
  }
}
