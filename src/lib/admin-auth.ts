/**
 * Admin allowlist: Privy IDs and/or X handles.
 * Env:
 *   ADMIN_PRIVY_ID=id1,id2
 *   ADMIN_TWITTER=tokenshit_,metasal   (comma, no @)
 * Default X admins always include tokenshit_ + metasal (union with env).
 */
import type { NextRequest } from "next/server";
import { requirePrivy, type PrivyIdentity } from "@/lib/privy-server";

export function normPrivyId(id: string): string {
  const s = id.trim().toLowerCase();
  return s.startsWith("did:privy:") ? s.slice("did:privy:".length) : s;
}

export function normTwitter(h: string): string {
  return h.trim().toLowerCase().replace(/^@/, "");
}

export function adminPrivyAllowlist(): string[] {
  return (process.env.ADMIN_PRIVY_ID || "")
    .split(",")
    .map((s) => normPrivyId(s))
    .filter(Boolean);
}

/** Built-in brand ops handles + env ADMIN_TWITTER / ADMIN_X */
export function adminTwitterAllowlist(): string[] {
  const fromEnv = (
    process.env.ADMIN_TWITTER ||
    process.env.ADMIN_X ||
    process.env.ADMIN_TWITTER_HANDLES ||
    ""
  )
    .split(",")
    .map(normTwitter)
    .filter(Boolean);
  const defaults = ["tokenshit_", "metasal"];
  return [...new Set([...defaults, ...fromEnv])];
}

export function isAdminIdentity(id: {
  privyId: string;
  twitter?: string | null;
}): boolean {
  const privyOk =
    adminPrivyAllowlist().length > 0 &&
    adminPrivyAllowlist().includes(normPrivyId(id.privyId));
  const tw = id.twitter ? normTwitter(id.twitter) : "";
  const twitterOk = !!tw && adminTwitterAllowlist().includes(tw);
  return privyOk || twitterOk;
}

export function adminConfigured(): boolean {
  return adminPrivyAllowlist().length > 0 || adminTwitterAllowlist().length > 0;
}

/**
 * Resolve admin access for a request.
 * - CRON_SECRET / x-admin-secret exact match → cron/automation
 * - Else Privy session must be on Privy or X allowlist
 */
export async function requireAdmin(req: NextRequest): Promise<
  | { ok: true; via: "cron" | "privy"; id?: PrivyIdentity }
  | { ok: false; res: Response }
> {
  const cronSecret =
    process.env.CRON_SECRET ||
    process.env.TREASURY_DROP_SECRET ||
    process.env.HERMES_CRON_SECRET ||
    "";

  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const headerSecret =
    req.headers.get("x-cron-secret") ||
    req.headers.get("x-admin-secret") ||
    "";

  if (cronSecret && (bearer === cronSecret || headerSecret === cronSecret)) {
    return { ok: true, via: "cron" };
  }

  if (!adminConfigured()) {
    return {
      ok: false,
      res: Response.json(
        { error: "Admin not configured (ADMIN_PRIVY_ID or ADMIN_TWITTER)" },
        { status: 503 }
      ),
    };
  }

  const auth = await requirePrivy(req, {});
  if (!auth.ok) return { ok: false, res: auth.res };

  if (!isAdminIdentity(auth.id)) {
    return {
      ok: false,
      res: Response.json(
        {
          error: "Forbidden — not on admin allowlist",
          yourId: auth.id.privyId,
          yourTwitter: auth.id.twitter,
          hint: "Login with X as @tokenshit_ or @metasal, or add your Privy id to ADMIN_PRIVY_ID",
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true, via: "privy", id: auth.id };
}
