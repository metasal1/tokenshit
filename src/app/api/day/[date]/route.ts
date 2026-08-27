import {
  formatHourLabel,
  getRound,
  listStakes,
  previousUtcHour,
  utcHourString,
} from "@/lib/day-game";
import { tursoExecute } from "@/lib/turso";
import { getAssetX } from "@/lib/token-x";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ date: string }> };

function resolveHourKey(raw: string): string {
  if (raw === "today" || raw === "now") return utcHourString();
  if (raw === "yesterday" || raw === "prev" || raw === "last") {
    return previousUtcHour(utcHourString());
  }
  // hour key 2026-08-13T14 or URL-encoded
  const decoded = decodeURIComponent(raw);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(decoded)) return decoded;
  // legacy full day
  if (/^\d{4}-\d{2}-\d{2}$/.test(decoded)) return decoded;
  return "";
}

/**
 * GET /api/day/[date] — hour receipt (YYYY-MM-DDTHH | prev | last)
 */
export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { date } = await ctx.params;
    const day = resolveHourKey(date);
    if (!day) {
      return Response.json(
        { error: "use YYYY-MM-DDTHH or prev" },
        { status: 400 }
      );
    }

    const round = await getRound(day);
    const stakes = await listStakes(day);

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
          twitter: await getAssetX(
            round.hitAssetId,
            String(r.rows[0][1] || "")
          ),
        };
      } else {
        hitMeta = {
          twitter: await getAssetX(round.hitAssetId, null),
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
          twitter: await getAssetX(
            round.shitAssetId,
            String(r.rows[0][1] || "")
          ),
        };
      } else {
        shitMeta = {
          twitter: await getAssetX(round.shitAssetId, null),
        };
      }
    }

    let metaJson: Record<string, unknown> | string | null = null;
    let hitVrf = null;
    let shitVrf = null;
    if (round?.meta) {
      try {
        metaJson = JSON.parse(round.meta);
        if (metaJson && typeof metaJson === "object") {
          hitVrf = (metaJson as { hitVrf?: unknown }).hitVrf || null;
          shitVrf = (metaJson as { shitVrf?: unknown }).shitVrf || null;
        }
      } catch {
        metaJson = round.meta;
      }
    }

    const { vrfExplorerLinks, vrfPrimaryLink } = await import(
      "@/lib/day-vrf-links"
    );

    return Response.json({
      cadence: "hourly",
      utcDay: day,
      utcHour: day,
      hourLabel: formatHourLabel(day),
      round,
      hitMeta,
      shitMeta,
      stakeCount: stakes.length,
      meta: metaJson,
      hitVrf,
      shitVrf,
      hitVrfLink: vrfPrimaryLink(hitVrf as never),
      shitVrfLink: vrfPrimaryLink(shitVrf as never),
      hitVrfLinks: vrfExplorerLinks(hitVrf as never),
      shitVrfLinks: vrfExplorerLinks(shitVrf as never),
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
