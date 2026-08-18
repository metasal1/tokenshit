import { type NextRequest } from "next/server";
import { executeJupVrfd } from "@/lib/jup-vrfd";
import { requirePrivy } from "@/lib/privy-server";
import { SHIT_MINT, X_HANDLE, X_URL } from "@/lib/shit-token";
import { getClientIp, rateLimitIp } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

/**
 * POST /api/jup/vrfd/execute
 * Body: signed base64 tx + requestId from craft + payment fields
 */
export async function POST(req: NextRequest) {
  const limited = await rateLimitIp({
    ip: getClientIp(req),
    bucket: "jup_vrfd_exec",
    limit: 10,
    windowHours: 1,
  });
  if (limited) return limited;

  const auth = await requirePrivy(req, {});
  if (!auth.ok) return auth.res;

  let body: {
    transaction?: string;
    requestId?: string;
    senderAddress?: string;
    mint?: string;
    paymentCurrency?: "JUP" | "SOL" | "USDC" | "JUPUSD";
    paymentAmount?: string;
    jupOutputAmount?: string;
    description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const transaction = String(body.transaction || "").trim();
  const requestId = String(body.requestId || "").trim();
  const senderAddress = String(body.senderAddress || "").trim();
  if (!transaction || !requestId || !senderAddress) {
    return Response.json(
      { error: "transaction, requestId, senderAddress required" },
      { status: 400 }
    );
  }

  try {
    const result = await executeJupVrfd({
      transaction,
      requestId,
      senderAddress,
      tokenId: body.mint || SHIT_MINT,
      twitterHandle: X_URL,
      senderTwitterHandle: auth.id.twitter
        ? `https://x.com/${auth.id.twitter}`
        : null,
      description:
        body.description ||
        `Express verify $${SHIT_MINT.slice(0, 6)}… by @${X_HANDLE}`,
      paymentCurrency: body.paymentCurrency || "SOL",
      paymentAmount: body.paymentAmount,
      jupOutputAmount: body.jupOutputAmount,
    });
    return Response.json({ ok: true, result });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    );
  }
}
