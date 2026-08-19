import { type NextRequest } from "next/server";
import { syncKolXListAndPrewarm } from "@/lib/kol-sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const secret =
    process.env.CRON_SECRET ||
    process.env.HERMES_CRON_SECRET ||
    process.env.TREASURY_DROP_SECRET ||
    "";
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const header =
    req.headers.get("x-cron-secret") || req.headers.get("x-admin-secret") || "";
  return bearer === secret || header === secret;
}

/**
 * POST /api/cron/kols-sync
 * Auth: Bearer CRON_SECRET
 * Body optional: { prewarm?: boolean, prewarmLimit?: number }
 *
 * 1) Pull X list (KOL_X_LIST_ID) → upsert live KOLs
 * 2) Pre-warm OG PNGs into memory/CDN cache
 */
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  let prewarm = true;
  let prewarmLimit = 40;
  try {
    const body = (await req.json()) as {
      prewarm?: boolean;
      prewarmLimit?: number;
    };
    if (typeof body.prewarm === "boolean") prewarm = body.prewarm;
    if (typeof body.prewarmLimit === "number")
      prewarmLimit = Math.max(0, Math.min(100, body.prewarmLimit));
  } catch {
    /* empty body ok */
  }

  try {
    const result = await syncKolXListAndPrewarm({ prewarm, prewarmLimit });
    return Response.json({ ok: true, ...result });
  } catch (e) {
    console.error("kols-sync", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // allow GET with secret for easy cron pings
  if (!authorized(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return POST(req);
}
