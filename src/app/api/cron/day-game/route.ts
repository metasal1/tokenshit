import { type NextRequest } from "next/server";
import {
  previousUtcHour,
  settleDay,
  snapshotPrices,
  utcHourString,
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
 * action=open|close|settle|hourly
 * hourly (default for cadence): settle previous hour + open-snap current
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
    let action = sp.get("action") || "hourly";
    let day = sp.get("day") || sp.get("hour") || "";
    try {
      const body = await request.json();
      if (body?.action) action = String(body.action);
      if (body?.day) day = String(body.day);
      if (body?.hour) day = String(body.hour);
    } catch {
      /* no body */
    }

    const nowHour = utcHourString();
    if (!day) {
      day = action === "open" ? nowHour : previousUtcHour(nowHour);
    }

    if (action === "open") {
      const n = await snapshotPrices(day, "open");
      return Response.json({ ok: true, action: "open", hour: day, assets: n });
    }
    if (action === "close") {
      const n = await snapshotPrices(day, "close");
      return Response.json({ ok: true, action: "close", hour: day, assets: n });
    }
    if (action === "settle" || action === "retry") {
      const force = action === "retry" || sp.get("force") === "1";
      await snapshotPrices(day, "close");
      const result = await settleDay(day, { force });
      if (result.ok && result.result && !result.result.already) {
        const r = result.result as {
          hitBag?: { assetId: string; pct: number };
          shitBag?: { assetId: string; pct: number };
          hit?: { winner: string | null; prize: number; fee: number };
          shit?: { winner: string | null; prize: number; fee: number };
          priceRetries?: number;
          boardHealth?: { ok: boolean; spread: number; nearZeroRatio: number };
          force?: boolean;
        };
        try {
          await sendTelegramMessage(
            [
              `<b>$HIT OF THE DAY</b> · ${force ? "retry " : ""}${escapeHtml(day)}`,
              r.hitBag
                ? `HIT: <code>${escapeHtml(r.hitBag.assetId)}</code> ${r.hitBag.pct.toFixed(2)}%`
                : "HIT bag: —",
              r.hit?.winner
                ? `HIT split: <code>${escapeHtml(r.hit.winner)}</code> +${Number(r.hit.prize).toLocaleString()}`
                : `HIT → empty / house`,
              r.shitBag
                ? `SHIT: <code>${escapeHtml(r.shitBag.assetId)}</code> ${r.shitBag.pct.toFixed(2)}%`
                : "SHIT bag: —",
              r.shit?.winner
                ? `SHIT split: <code>${escapeHtml(r.shit.winner)}</code> +${Number(r.shit.prize).toLocaleString()}`
                : `SHIT → empty / house`,
              r.boardHealth
                ? `board spread ${r.boardHealth.spread.toFixed(2)}% · retries ${r.priceRetries ?? 0}`
                : "",
              `<a href="https://tokenshit.com/winners">Winners</a>`,
            ]
              .filter(Boolean)
              .join("\n")
          );
        } catch {
          /* ignore */
        }
      }
      return Response.json(result);
    }

    // hourly tick: close+settle last hour, open current
    if (action === "hourly" || action === "daily") {
      const prev = previousUtcHour(nowHour);
      await snapshotPrices(prev, "close");
      const settled = await settleDay(prev);
      // Public witness: TG alert every fresh finalize (hourly path)
      if (settled.ok && settled.result && !(settled.result as { already?: boolean }).already) {
        const r = settled.result as {
          hitBag?: { assetId: string; pct: number };
          shitBag?: { assetId: string; pct: number };
          hit?: { winner: string | null; prize: number; fee: number; prizeSig?: string | null };
          shit?: { winner: string | null; prize: number; fee: number; prizeSig?: string | null };
        };
        try {
          const lines = [
            `🎬 <b>$HIT OF THE DAY</b> · finalize · ${escapeHtml(prev)}`,
            r.hitBag
              ? `🎯 HIT <code>${escapeHtml(r.hitBag.assetId)}</code> ${r.hitBag.pct.toFixed(2)}%`
              : "🎯 HIT bag: —",
            r.hit?.winner
              ? `💰 HIT pot <b>+${Number(r.hit.prize).toLocaleString()}</b> split → <code>${escapeHtml(r.hit.winner)}</code>${r.hit.prizeSig ? `\n<a href="https://solscan.io/tx/${escapeHtml(r.hit.prizeSig)}">payout tx</a>` : ""}`
              : "HIT → empty / house",
            r.shitBag
              ? `💀 SHIT <code>${escapeHtml(r.shitBag.assetId)}</code> ${r.shitBag.pct.toFixed(2)}%`
              : "💀 SHIT bag: —",
            r.shit?.winner
              ? `💰 SHIT pot <b>+${Number(r.shit.prize).toLocaleString()}</b> split → <code>${escapeHtml(r.shit.winner)}</code>${r.shit.prizeSig ? `\n<a href="https://solscan.io/tx/${escapeHtml(r.shit.prizeSig)}">payout tx</a>` : ""}`
              : "SHIT → empty / house",
            `👀 <a href="https://tokenshit.com/winners">Winners</a> · <a href="https://tokenshit.com/play">Play</a>`,
          ];
          await sendTelegramMessage(lines.join("\n"));
        } catch {
          /* ignore */
        }
      }
      const openN = await snapshotPrices(nowHour, "open");
      return Response.json({
        ok: true,
        cadence: "hourly",
        open: { hour: nowHour, assets: openN },
        settle: settled,
      });
    }

    return Response.json(
      { error: "action must be open|close|settle|retry|hourly" },
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
