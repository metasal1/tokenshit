import { type NextRequest } from "next/server";
import {
  normalizePem,
  verifyPrivyAccessToken,
  bearerFrom,
} from "@/lib/privy-server";

export const dynamic = "force-dynamic";

/**
 * Auth health — no secrets leaked.
 * GET: config check
 * POST { accessToken }: try verify and return meta
 */
export async function GET() {
  const appId =
    process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID || "";
  const hasSecret = Boolean(process.env.PRIVY_APP_SECRET);
  const rawVk = process.env.PRIVY_VERIFICATION_KEY || "";
  let pemOk = false;
  let pemLen = 0;
  let pemErr: string | null = null;
  try {
    if (rawVk) {
      const pem = normalizePem(rawVk);
      pemLen = pem.length;
      pemOk = pem.includes("BEGIN PUBLIC KEY") && pem.includes("\n");
    }
  } catch (e) {
    pemErr = e instanceof Error ? e.message : String(e);
  }
  return Response.json({
    appId,
    appIdLen: appId.length,
    hasSecret,
    hasVerificationKey: Boolean(rawVk),
    pemOk,
    pemLen,
    pemErr,
    live: true,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token =
    (typeof body.accessToken === "string" && body.accessToken) ||
    bearerFrom(request);
  if (!token) {
    return Response.json({ error: "send accessToken" }, { status: 400 });
  }
  const result = await verifyPrivyAccessToken(token);
  return Response.json(result, { status: result.ok ? 200 : 401 });
}
