import {
  getRound,
  listStakes,
  utcDayString,
  previousUtcDay,
} from "@/lib/day-game";
import { tursoExecute } from "@/lib/turso";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ date: string }> };

/**
 * GET /api/day/[date] — settlement receipt (yyyy-mm-dd)
 */
export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { date } = await ctx.params;
    const day = /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : date === "today"
        ? utcDayString()
        : date === "yesterday"
          ? previousUtcDay(utcDayString())
          : "";
    if (!day) {
      return Response.json({ error: "use yyyy-mm-dd" }, { status: 400 });
    }

    const round = await getRound(day);
    const stakes = await listStakes(day);

    // bag meta from prices if any
    let hitMeta = null;
    let shitMeta = null;
    if (round?.hitAssetId) {
      const r = await tursoExecute(
        `SELECT name, symbol, logo, price, volume24h FROM day_prices
         WHERE utc_day = ? AND asset_id = ? AND phase = 'close' LIMIT 1`,
        [day, round.hitAssetId]
      );
      if (r.rows[0]) {
        hitMeta = {
          name: String(r.rows[0][0] || ""),
          symbol: String(r.rows[0][1] || ""),
          logo: String(r.rows[0][2] || ""),
          closePrice: Number(r.rows[0][3]),
          volume24h: Number(r.rows[0][4] || 0),
        };
      }
    }
    if (round?.shitAssetId) {
      const r = await tursoExecute(
        `SELECT name, symbol, logo, price, volume24h FROM day_prices
         WHERE utc_day = ? AND asset_id = ? AND phase = 'close' LIMIT 1`,
        [day, round.shitAssetId]
      );
      if (r.rows[0]) {
        shitMeta = {
          name: String(r.rows[0][0] || ""),
          symbol: String(r.rows[0][1] || ""),
          logo: String(r.rows[0][2] || ""),
          closePrice: Number(r.rows[0][3]),
          volume24h: Number(r.rows[0][4] || 0),
        };
      }
    }

    let metaJson = null;
    if (round?.meta) {
      try {
        metaJson = JSON.parse(round.meta);
      } catch {
        metaJson = round.meta;
      }
    }

    return Response.json({
      utcDay: day,
      round,
      hitMeta,
      shitMeta,
      stakeCount: stakes.length,
      meta: metaJson,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
