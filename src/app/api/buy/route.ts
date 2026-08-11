import { type NextRequest } from "next/server";
import {
  BUY_FEE_BPS,
  JUP_QUOTE,
  JUP_SWAP,
  SHIT_FEE_ATA,
  SHIT_MINT,
  SOL_MINT,
  jupHeaders,
} from "@/lib/buy-fee";

export const dynamic = "force-dynamic";

/**
 * GET /api/buy?amountLamports=100000000
 * Default: no platform fee (fee=1 to enable).
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const amountLamports = sp.get("amountLamports") || "100000000";
  const slippageBps = sp.get("slippageBps") || "150";
  // Fees off by default — UI does not surface fees
  const withFee = sp.get("fee") === "1";

  const url = new URL(JUP_QUOTE);
  url.searchParams.set("inputMint", SOL_MINT);
  url.searchParams.set("outputMint", SHIT_MINT);
  url.searchParams.set("amount", amountLamports);
  url.searchParams.set("slippageBps", slippageBps);
  if (withFee) {
    url.searchParams.set("platformFeeBps", String(BUY_FEE_BPS));
  }

  try {
    const res = await fetch(url.toString(), {
      headers: jupHeaders(),
      cache: "no-store",
    });
    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { error: `Jupiter non-JSON: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }
    if (!res.ok) {
      if (withFee) {
        // fallback no-fee quote
        const u2 = new URL(JUP_QUOTE);
        u2.searchParams.set("inputMint", SOL_MINT);
        u2.searchParams.set("outputMint", SHIT_MINT);
        u2.searchParams.set("amount", amountLamports);
        u2.searchParams.set("slippageBps", slippageBps);
        const r2 = await fetch(u2.toString(), {
          headers: jupHeaders(),
          cache: "no-store",
        });
        const d2 = await r2.json();
        if (r2.ok) {
          return Response.json({
            quote: d2,
            feeBps: 0,
            feeAccount: null,
            inputMint: SOL_MINT,
            outputMint: SHIT_MINT,
          });
        }
      }
      return Response.json(
        { error: data?.error || data?.message || text.slice(0, 200), data },
        { status: res.status }
      );
    }
    return Response.json({
      quote: data,
      feeBps: withFee ? BUY_FEE_BPS : 0,
      feeAccount: withFee ? SHIT_FEE_ATA : null,
      inputMint: SOL_MINT,
      outputMint: SHIT_MINT,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

/**
 * POST /api/buy — build swap tx from quote
 * Body: { quoteResponse, userPublicKey }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const quoteResponse = body.quoteResponse || body.quote;
    const userPublicKey = String(body.userPublicKey || "");
    if (!quoteResponse || !userPublicKey) {
      return Response.json(
        { error: "quoteResponse and userPublicKey required" },
        { status: 400 }
      );
    }

    // Fees off unless explicitly requested
    const useFee =
      body.fee === true ||
      body.fee === 1 ||
      (body.feeBps != null && Number(body.feeBps) > 0);

    const payload: Record<string, unknown> = {
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
      asLegacyTransaction: false,
    };
    if (useFee) {
      payload.feeAccount = body.feeAccount || SHIT_FEE_ATA;
    }

    const res = await fetch(JUP_SWAP, {
      method: "POST",
      headers: jupHeaders(),
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { error: `Jupiter swap non-JSON: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }
    if (!res.ok) {
      // retry without fee account if fee caused failure
      if (useFee) {
        const r2 = await fetch(JUP_SWAP, {
          method: "POST",
          headers: jupHeaders(),
          body: JSON.stringify({
            quoteResponse,
            userPublicKey,
            wrapAndUnwrapSol: true,
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: "auto",
          }),
        });
        const t2 = await r2.text();
        try {
          data = JSON.parse(t2);
        } catch {
          return Response.json(
            { error: `Jupiter swap non-JSON: ${t2.slice(0, 200)}` },
            { status: 502 }
          );
        }
        if (r2.ok) {
          return Response.json({ ...data, feeBps: 0, feeAccount: null });
        }
      }
      return Response.json(
        { error: data?.error || data?.message || text.slice(0, 200), data },
        { status: res.status }
      );
    }
    return Response.json({
      ...data,
      feeBps: useFee ? BUY_FEE_BPS : 0,
      feeAccount: useFee ? SHIT_FEE_ATA : null,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
