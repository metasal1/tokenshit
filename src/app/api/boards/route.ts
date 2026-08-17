import {
  getHitShitPeriodBoards,
  getLiveLeaders,
  utcHourString,
  type PeriodKey,
} from "@/lib/day-game";

export const dynamic = "force-dynamic";

/**
 * GET /api/boards?period=hour|day|week&limit=24
 * HIT + SHIT boards aggregated by period.
 */
export async function GET(request: Request) {
  try {
    const sp = new URL(request.url).searchParams;
    const raw = String(sp.get("period") || "hour").toLowerCase();
    const period: PeriodKey =
      raw === "day" || raw === "week" || raw === "daily" || raw === "weekly"
        ? raw.startsWith("d")
          ? "day"
          : "week"
        : "hour";
    const limit = Number(sp.get("limit") || (period === "hour" ? 36 : period === "day" ? 14 : 8));

    const [boards, live] = await Promise.all([
      getHitShitPeriodBoards(period, limit),
      getLiveLeaders(utcHourString()).catch(() => null),
    ]);

    return Response.json(
      {
        ...boards,
        live: live
          ? {
              hour: utcHourString(),
              hitting: live.hitting,
              shitting: live.shitting,
              compared: live.compared,
            }
          : null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
