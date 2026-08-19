import { type NextRequest } from "next/server";
import {
  insertKolNomination,
  lookupKolProfile,
  normalizeKolHandle,
  MIN_KOL_FOLLOWERS,
} from "@/lib/kol-noms";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";
import { getClientIp, rateLimitIp } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return "unknown";
}

/** GET ?handle=@foo — live X lookup (followers check) */
export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle") || "";
  if (!normalizeKolHandle(handle)) {
    return Response.json(
      { error: "Enter a valid X handle or profile URL", minFollowers: MIN_KOL_FOLLOWERS },
      { status: 400 }
    );
  }
  const limited = await rateLimitIp({
    ip: getClientIp(request),
    bucket: "kol_lookup",
    limit: 40,
    windowHours: 1,
  });
  if (limited) return limited;

  const look = await lookupKolProfile(handle);
  if (!look.ok) {
    return Response.json(
      { error: look.error, code: look.code, minFollowers: MIN_KOL_FOLLOWERS },
      { status: 404 }
    );
  }
  return Response.json(look);
}

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const handle = String(body.handle || body.kol || "");
    const note = body.note != null ? String(body.note) : null;
    const byX =
      body.byX != null
        ? String(body.byX)
        : body.twitter != null
          ? String(body.twitter)
          : null;
    const byWallet =
      body.byWallet != null
        ? String(body.byWallet)
        : body.wallet != null
          ? String(body.wallet)
          : null;
    const source =
      body.source != null ? String(body.source).slice(0, 32) : "claim";

    const norm = normalizeKolHandle(handle);
    if (!norm) {
      return Response.json(
        { error: "Enter a valid X handle (@name or x.com/…)" },
        { status: 400 }
      );
    }

    // Always re-lookup server-side (don't trust client followers)
    const look = await lookupKolProfile(norm);
    if (!look.ok) {
      return Response.json(
        { error: look.error, code: look.code },
        { status: 400 }
      );
    }
    if (!look.meetsMin) {
      return Response.json(
        {
          error: `@${look.handle} has ${look.followers.toLocaleString()} followers — need ${MIN_KOL_FOLLOWERS.toLocaleString()}+`,
          code: "low_followers",
          followers: look.followers,
          minFollowers: MIN_KOL_FOLLOWERS,
        },
        { status: 400 }
      );
    }

    const result = await insertKolNomination({
      handle: look.handle,
      note,
      byX,
      byWallet,
      ip: clientIp(request),
      source,
      profile: {
        followers: look.followers,
        displayName: look.displayName,
        avatarUrl: look.avatarUrl,
      },
    });

    if (!result.ok) {
      const status = result.code?.startsWith("rate") ? 429 : 400;
      return Response.json(
        {
          error: result.error,
          code: result.code,
          followers: result.followers,
          minFollowers: MIN_KOL_FOLLOWERS,
        },
        { status }
      );
    }

    if (!result.already) {
      const who = byX
        ? `@${escapeHtml(String(byX).replace(/^@/, ""))}`
        : "anon";
      const fl = look.followers.toLocaleString();
      const text = [
        `KOL nom (claim)`,
        `→ @${escapeHtml(result.handle)} · ${escapeHtml(fl)} flw`,
        look.displayName
          ? `name: ${escapeHtml(look.displayName.slice(0, 40))}`
          : "",
        `by ${who}`,
        note ? `note: ${escapeHtml(String(note).slice(0, 120))}` : "",
        `id ${result.id}`,
        `admin: https://tokenshit.com/admin?tab=kols`,
      ]
        .filter(Boolean)
        .join("\n");
      void Promise.race([
        sendTelegramMessage(text),
        new Promise((r) => setTimeout(r, 2500)),
      ]).catch(() => {});
    }

    return Response.json({
      ok: true,
      handle: result.handle,
      id: result.id,
      already: !!result.already,
      followers: look.followers,
      displayName: look.displayName,
      avatarUrl: look.avatarUrl,
      minFollowers: MIN_KOL_FOLLOWERS,
      message: result.already
        ? `@${result.handle} is already on the list or pending`
        : `@${result.handle} (${look.followers.toLocaleString()} flw) queued for review`,
    });
  } catch (e) {
    console.error("kol nominate", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
