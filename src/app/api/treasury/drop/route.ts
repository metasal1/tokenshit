import { type NextRequest } from "next/server";
import {
  GLOBAL_TREASURY_DAILY_DROP,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";
import {
  hasDroppedToday,
  recordDrop,
  buildDropSchedule,
} from "@/lib/treasury-drop";

export const dynamic = "force-dynamic";

/**
 * POST /api/treasury/drop
 * Called by external cron at UTC 00:00 after funding/sending 1M.
 *
 * Auth: Authorization: Bearer $CRON_SECRET (or x-cron-secret header)
 *
 * Body (optional):
 *   { amount?: number, signature?: string, note?: string, force?: boolean }
 *
 * Does NOT move tokens itself — records that today's drop happened so the UI
 * can show "dropped" until next UTC midnight. Wire your Hermes/cron to:
 *   1) transfer 1M $TOKENSHIT into treasury (or mint)
 *   2) POST here with tx signature
 */
export async function POST(request: NextRequest) {
  const secret =
    process.env.CRON_SECRET ||
    process.env.TREASURY_DROP_SECRET ||
    process.env.HERMES_CRON_SECRET ||
    "";
  const auth = request.headers.get("authorization") || "";
  const headerSecret =
    request.headers.get("x-cron-secret") ||
    request.headers.get("x-treasury-drop-secret") ||
    "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const provided = bearer || headerSecret;

  if (!secret) {
    return Response.json(
      { error: "CRON_SECRET not configured on server" },
      { status: 503 }
    );
  }
  if (!provided || provided !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const amount = Number(body.amount ?? GLOBAL_TREASURY_DAILY_DROP);
    const signature = body.signature ? String(body.signature) : null;
    const note = body.note ? String(body.note) : "daily_utc0";
    const force = Boolean(body.force);
    const now = new Date();

    if (!force && (await hasDroppedToday(now))) {
      return Response.json(
        {
          ok: false,
          error: "Already recorded drop for this UTC day",
          schedule: buildDropSchedule(now),
        },
        { status: 409 }
      );
    }

    const { utcDay } = await recordDrop({
      amount: Number.isFinite(amount) ? amount : GLOBAL_TREASURY_DAILY_DROP,
      signature,
      note,
      at: now,
    });

    return Response.json({
      ok: true,
      utcDay,
      amount: Number.isFinite(amount) ? amount : GLOBAL_TREASURY_DAILY_DROP,
      signature,
      treasury: TREASURY_ADDRESS,
      schedule: buildDropSchedule(now),
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  const now = new Date();
  return Response.json({
    dropAmount: GLOBAL_TREASURY_DAILY_DROP,
    schedule: buildDropSchedule(now),
    endpoint: "POST /api/treasury/drop",
    auth: "Bearer CRON_SECRET",
  });
}
