import { type NextRequest } from "next/server";
import { pickRandomToken } from "@/lib/random-pool";

export const dynamic = "force-dynamic";

/**
 * GET /api/random-token
 * Returns { assetId } from full pool (not spicy-only majors).
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

    return Response.json(
      { assetId: token?.assetId || null, list: token?.list },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ assetId: null });
  }
}
