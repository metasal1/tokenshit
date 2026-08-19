import { type NextRequest } from "next/server";
import {
  insertKolNomination,
  lookupKolProfile,
  normalizeKolHandle,
  MIN_KOL_FOLLOWERS,
} from "@/lib/kol-noms";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";
import { getClientIp, rateLimitIp } from "@/lib/api-guard";
import { requirePrivy } from "@/lib/privy-server";
import {
  assertNotBlacklisted,
  isBlacklistedTwitter,
  isBlacklistedWallet,
} from "@/lib/security";
import { gateXProfileForClaim, recordAbuseEvent } from "@/lib/abuse";
import { ABUSE_MIN_FOLLOWERS_CLAIM } from "@/lib/shit-token";

export const dynamic = "force-dynamic";

/** In-memory lookup cache — cuts X API spam from GET farm */
const LOOKUP_CACHE = new Map<
  string,
  { at: number; body: Record<string, unknown>; status: number }
>();
const LOOKUP_CACHE_TTL_MS = 10 * 60 * 1000;
const LOOKUP_CACHE_MAX = 500;

function cacheGet(handle: string) {
  const k = handle.toLowerCase();
  const hit = LOOKUP_CACHE.get(k);
  if (!hit) return null;
  if (Date.now() - hit.at > LOOKUP_CACHE_TTL_MS) {
    LOOKUP_CACHE.delete(k);
    return null;
  }
  return hit;
}

function cacheSet(handle: string, status: number, body: Record<string, unknown>) {
  if (LOOKUP_CACHE.size > LOOKUP_CACHE_MAX) {
    // drop oldest ~20%
    const keys = [...LOOKUP_CACHE.keys()].slice(0, 100);
    for (const k of keys) LOOKUP_CACHE.delete(k);
  }
  LOOKUP_CACHE.set(handle.toLowerCase(), { at: Date.now(), status, body });
}

/** GET ?handle=@foo — live X lookup (rate-limited, cached) */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const handleRaw = request.nextUrl.searchParams.get("handle") || "";
  const norm = normalizeKolHandle(handleRaw);
  if (!norm) {
    return Response.json(
      {
        error: "Enter a valid X handle or profile URL",
        minFollowers: MIN_KOL_FOLLOWERS,
      },
      { status: 400 }
    );
  }

  // Block obvious farm targets / blacklisted KOLs
  if (isBlacklistedTwitter(norm)) {
    return Response.json(
      { error: "Handle not eligible", code: "blocked_handle" },
      { status: 403 }
    );
  }

  // Tight IP limit on uncached lookups (cache hits still count lightly)
  const limited = await rateLimitIp({
    ip,
    bucket: "kol_lookup",
    limit: 20, // was 40
    windowHours: 1,
  });
  if (limited) {
    await recordAbuseEvent("kol_lookup_rate", ip, norm, {}).catch(() => {});
    return limited;
  }

  const cached = cacheGet(norm);
  if (cached) {
    return Response.json(cached.body, { status: cached.status });
  }

  const look = await lookupKolProfile(norm);
  if (!look.ok) {
    const body = {
      error: look.error,
      code: look.code,
      minFollowers: MIN_KOL_FOLLOWERS,
    };
    // cache misses briefly to stop hammering bad handles
    cacheSet(norm, 404, body);
    return Response.json(body, { status: 404 });
  }

  const body = { ...look };
  cacheSet(norm, 200, body);
  return Response.json(body);
}

/**
 * POST — recommend KOL for admin review.
 * Anti-farm:
 *  - Privy + X required (body byX ignored for identity)
 *  - Scout profile gate (100+ flw + PFP)
 *  - Wallet blacklist
 *  - Cannot nominate self
 *  - Target must be 10k+ flw (server re-lookup)
 *  - IP + scout daily caps
 *  - Honeypot field rejected
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  try {
    // Fail closed on IP farm before body parse cost
    const ipLimit = await rateLimitIp({
      ip,
      bucket: "kol_nominate",
      limit: 8,
      windowHours: 24,
    });
    if (ipLimit) {
      await recordAbuseEvent("kol_nom_rate_ip", ip, null, {}).catch(() => {});
      return ipLimit;
    }

    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Honeypot — bots fill hidden fields
    if (body.website || body.url || body.company || body.fax) {
      await recordAbuseEvent("kol_nom_honeypot", ip, null, {
        keys: Object.keys(body).slice(0, 12),
      }).catch(() => {});
      // fake success so bots stop
      return Response.json({
        ok: true,
        already: true,
        message: "Queued",
      });
    }

    const handle = String(body.handle || body.kol || "");
    const note = body.note != null ? String(body.note).slice(0, 280) : null;
    const source =
      body.source != null ? String(body.source).slice(0, 32) : "claim";

    const norm = normalizeKolHandle(handle);
    if (!norm) {
      return Response.json(
        { error: "Enter a valid X handle (@name or x.com/…)" },
        { status: 400 }
      );
    }

    // Auth: X compulsory — never trust body.twitter / body.byX
    const auth = await requirePrivy(request, {
      requireTwitter: true,
      wallet: body.wallet ? String(body.wallet) : null,
      body,
    });
    if (!auth.ok) return auth.res;

    const byX = (auth.id.twitter || "").replace(/^@/, "").toLowerCase();
    if (!byX) {
      return Response.json(
        { error: "Sign in with X to recommend KOLs", code: "x_required" },
        { status: 403 }
      );
    }

    if (isBlacklistedTwitter(byX)) {
      await recordAbuseEvent("kol_nom_blocked_scout", ip, byX, {}).catch(
        () => {}
      );
      return Response.json(
        { error: "Account not eligible to nominate", code: "scout_blocked" },
        { status: 403 }
      );
    }

    // Wallet: only Privy-linked if provided
    let byWallet: string | null = null;
    if (auth.id.wallets?.length) {
      const want = body.wallet ? String(body.wallet).trim() : "";
      if (want) {
        const match = auth.id.wallets.find(
          (w) => w.toLowerCase() === want.toLowerCase()
        );
        if (!match) {
          return Response.json(
            { error: "Wallet must be linked to your X account", code: "wallet_mismatch" },
            { status: 403 }
          );
        }
        byWallet = match;
      } else {
        byWallet = auth.id.wallets[0] || null;
      }
    }
    if (byWallet) {
      if (isBlacklistedWallet(byWallet)) {
        return Response.json(
          { error: "Wallet blocked", code: "wallet_blocked" },
          { status: 403 }
        );
      }
      const blocked = assertNotBlacklisted(byWallet);
      if (blocked) return blocked;
    }

    // Scout quality gate (same bar as claims: 100 flw + PFP)
    const profileGate = await gateXProfileForClaim(byX);
    if (!profileGate.ok) {
      await recordAbuseEvent("kol_nom_scout_gate", ip, byX, {
        code: profileGate.code,
      }).catch(() => {});
      return Response.json(
        {
          error:
            profileGate.error ||
            `Your X needs ${ABUSE_MIN_FOLLOWERS_CLAIM}+ followers and a profile photo to nominate KOLs`,
          code: profileGate.code || "scout_quality",
        },
        { status: profileGate.status || 403 }
      );
    }

    // Per-scout rate (in addition to IP)
    const scoutLimit = await rateLimitIp({
      ip: `x:${byX}`,
      bucket: "kol_nominate_scout",
      limit: 5,
      windowHours: 24,
    });
    if (scoutLimit) {
      await recordAbuseEvent("kol_nom_rate_scout", ip, byX, {}).catch(() => {});
      return Response.json(
        {
          error: "Daily nomination limit reached (5). Try tomorrow.",
          code: "rate_scout",
        },
        { status: 429 }
      );
    }

    if (isBlacklistedTwitter(norm)) {
      return Response.json(
        { error: "Handle not eligible", code: "blocked_handle" },
        { status: 403 }
      );
    }

    // No self-noms
    if (norm === byX) {
      return Response.json(
        { error: "You can't nominate yourself", code: "self_nom" },
        { status: 400 }
      );
    }

    // Always re-lookup server-side (don't trust client)
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
      ip,
      source,
      profile: {
        followers: look.followers,
        displayName: look.displayName,
        avatarUrl: look.avatarUrl,
      },
    });

    if (!result.ok) {
      const status = result.code?.startsWith("rate") ? 429 : 400;
      if (result.code?.startsWith("rate")) {
        await recordAbuseEvent("kol_nom_rate_db", ip, byX, {
          code: result.code,
        }).catch(() => {});
      }
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
      await recordAbuseEvent("kol_nom_ok", ip, byX, {
        handle: result.handle,
        followers: look.followers,
      }).catch(() => {});

      const fl = look.followers.toLocaleString();
      const text = [
        `KOL nom`,
        `→ @${escapeHtml(result.handle)} · ${escapeHtml(fl)} flw`,
        look.displayName
          ? `name: ${escapeHtml(look.displayName.slice(0, 40))}`
          : "",
        `by @${escapeHtml(byX)}`,
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
      // omit avatar on success to shrink abuse bandwidth (UI has it from lookup)
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
