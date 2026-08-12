import { type NextRequest } from "next/server";
import { requireCronSecret } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

/**
 * Auth health — debug only, locked behind CRON_SECRET.
 * Do not expose app JWKS kids / verify tooling publicly.
 */
export async function GET(request: NextRequest) {
  const denied = requireCronSecret(request);
  if (denied) return denied;
  return Response.json({
    ok: true,
    appIdPrefix: (process.env.NEXT_PUBLIC_PRIVY_APP_ID || "").slice(0, 8),
    hasSecret: Boolean(process.env.PRIVY_APP_SECRET),
    hasSubtle: typeof crypto !== "undefined" && !!crypto.subtle,
  });
}

export async function POST(request: NextRequest) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  // Minimal locked probe — no public token lab
  const body = await request.json().catch(() => ({}));
  const hasToken = Boolean(
    (typeof body.accessToken === "string" && body.accessToken) ||
      request.headers.get("authorization")
  );
  return Response.json({
    ok: true,
    hasToken,
    note: "Full verify runs on claim paths via privy-server webcrypto",
  });
}
