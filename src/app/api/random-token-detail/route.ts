import { type NextRequest } from "next/server";
import { pickRandomToken } from "@/lib/random-pool";

export const dynamic = "force-dynamic";

/**
 * GET /api/random-token-detail
 * Query: exclude=assetId&excludeIds=a,b,c&username=
 * Full curated pool (all categories), soft spicy bias, skip recent.
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const exclude = sp.get("exclude") || sp.get("excludeAssetId");
    const username = sp.get("username") || sp.get("voterId");
    const excludeIds = (sp.get("excludeIds") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);

    const token = await pickRandomToken({
      username,
      excludeAssetId: exclude,
      excludeIds,
    });

    if (!token) {
      return Response.json({ assetId: null }, { status: 404 });
    }

    return Response.json(
      {
        assetId: token.assetId,
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        list: token.list,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (e) {
    return Response.json(
      { assetId: null, error: String(e) },
      { status: 500 }
    );
  }
}
