import { listPastWinners, type DaySide } from "@/lib/day-game";

export const dynamic = "force-dynamic";

/**
 * GET /api/day/winners?side=hit|shit&limit=50
 */
export async function GET(request: Request) {
  try {
    const sp = new URL(request.url).searchParams;
    const sideRaw = String(sp.get("side") || "hit").toLowerCase();
    const side: DaySide = sideRaw === "shit" ? "shit" : "hit";
    const limit = Number(sp.get("limit") || 50);
    const winners = await listPastWinners(side, limit);
    return Response.json({
      side,
      count: winners.length,
      winners,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
