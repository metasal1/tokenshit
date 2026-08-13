import { type NextRequest } from "next/server";
import {
  previousUtcDay,
  settleDay,
  snapshotPrices,
  utcDayString,
  DAY_GAME_ENABLED,
} from "@/lib/day-game";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";

export const dynamic = "force-dynamic";

function authorize(request: NextRequest): boolean {
  const secret =
    process.env.CRON_SECRET ||
    process.env.DAY_GAME_CRON_SECRET ||
    process.env.TOKENS_CRON_SECRET ||
    "";
  if (!secret) return process.env.NODE_ENV !== "production";
  const h =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    request.headers.get("x-cron-secret") ||
    "";
  return h === secret;
}

/**
 * POST /api/cron/day-game
 * body/query: action=open|close|settle
 * - open: snapshot open prices for today
 * - close: snapshot close for yesterday (or ?day=)
 * - settle: settle yesterday (or ?day=)
 */
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!DAY_GAME_ENABLED) {
    return Response.json({ error: "paused" }, { status: 503 });
  }

  try {
    const sp = request.nextUrl.searchParams;
    let action = sp.get("action") || "settle";
    let day = sp.get("day") || "";
    try {
      const body = await request.json();
      if (body?.action) action = String(body.action);
      if (body?.day) day = String(body.day);
    } catch {
      /* no body */
    }

    const today = utcDayString();
    if (!day) {
      day = action === "open" ? today : previousUtcDay(today);
    }

    if (action === "open") {
      const n = await snapshotPrices(day, "open");
      return Response.json({ ok: true, action: "open", day, assets: n });
    }
    if (action === "close") {
      const n = await snapshotPrices(day, "close");
      return Response.json({ ok: true, action: "close", day, assets: n });
    }
    if (action === "settle") {
      // ensure close snap
      await snapshotPrices(day, "close");
      const result = await settleDay(day);
      if (result.ok && result.result && !result.result.already) {
        const r = result.result as {
          hitBag?: { assetId: string; pct: number };
          shitBag?: { assetId: string; pct: number };
          hit?: { winner: string | null; prize: number; fee: number };
          shit?: { winner: string | null; prize: number; fee: number };
        };
        try {
          await sendTelegramMessage(
            [
              `<b>Hit/Shit of the Day</b> · ${escapeHtml(day)}`,
              r.hitBag
                ? `HIT bag: <code>${escapeHtml(r.hitBag.assetId)}</code> ${r.hitBag.pct.toFixed(2)}%`
                : "HIT bag: —",
              r.hit?.winner
                ? `HIT winner: <code>${escapeHtml(r.hit.winner)}</code> +${Number(r.hit.prize).toLocaleString()} (fee ${Number(r.hit.fee).toLocaleString()})`
                : `HIT pot → treasury (fee ${Number(r.hit?.fee || 0).toLocaleString()})`,
              r.shitBag
                ? `SHIT bag: <code>${escapeHtml(r.shitBag.assetId)}</code> ${r.shitBag.pct.toFixed(2)}%`
                : "SHIT bag: —",
              r.shit?.winner
                ? `SHIT winner: <code>${escapeHtml(r.shit.winner)}</code> +${Number(r.shit.prize).toLocaleString()} (fee ${Number(r.shit.fee).toLocaleString()})`
                : `SHIT pot → treasury (fee ${Number(r.shit?.fee || 0).toLocaleString()})`,
            ].join("\n")
          );
        } catch {
          /* ignore tg */
        }
      }
      return Response.json(result);
    }

    // full daily: open today + settle yesterday
    if (action === "daily") {
      const openN = await snapshotPrices(today, "open");
      const y = previousUtcDay(today);
      await snapshotPrices(y, "close");
      const settled = await settleDay(y);
      return Response.json({
        ok: true,
        open: { day: today, assets: openN },
        settle: settled,
      });
    }

    return Response.json(
      { error: "action must be open|close|settle|daily" },
      { status: 400 }
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
