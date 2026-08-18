import { type NextRequest } from "next/server";
import { craftJupVrfdTxn, checkJupVrfdEligibility } from "@/lib/jup-vrfd";
import { requirePrivy } from "@/lib/privy-server";
import { SHIT_MINT } from "@/lib/shit-token";
import { getClientIp, rateLimitIp } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

/**
 * POST /api/jup/vrfd/craft
 * Body: { senderAddress, paymentCurrency?: SOL|JUP|USDC }
 * Returns unsigned base64 tx + requestId for wallet sign.
 */
export async function POST(req: NextRequest) {
  const limited = await rateLimitIp({
    ip: getClientIp(req),
    bucket: "jup_vrfd_craft",
    limit: 20,
    windowHours: 1,
  });
  if (limited) return limited;

  const auth = await requirePrivy(req, {});
  if (!auth.ok) return auth.res;

  let body: {
    senderAddress?: string;
    paymentCurrency?: "JUP" | "SOL" | "USDC" | "JUPUSD";
    mint?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sender = String(body.senderAddress || "").trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(sender)) {
    return Response.json({ error: "Invalid senderAddress" }, { status: 400 });
  }

  // Prefer linked wallet when available
  if (auth.id.wallets.length) {
    const ok = auth.id.wallets.some(
      (w) => w.toLowerCase() === sender.toLowerCase()
    );
    if (!ok) {
      return Response.json(
        { error: "senderAddress must be your linked Privy Solana wallet" },
        { status: 403 }
      );
    }
  }

  const mint = String(body.mint || SHIT_MINT).trim();
  try {
    const elig = await checkJupVrfdEligibility(mint);
    if (elig.isVerified) {
      return Response.json({
        error: "Already Jupiter-verified",
        eligibility: elig,
      }, { status: 409 });
    }
    if (!elig.canVerify && !elig.canMetadata) {
      return Response.json(
        {
          error:
            elig.verificationError ||
            elig.metadataError ||
            "Not eligible for Express submit",
          eligibility: elig,
        },
        { status: 400 }
      );
    }

    const craft = await craftJupVrfdTxn({
      senderAddress: sender,
      paymentCurrency: body.paymentCurrency || "SOL",
    });
    return Response.json({
      ok: true,
      mint,
      craft,
      paymentCurrency: body.paymentCurrency || "SOL",
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    );
  }
}
