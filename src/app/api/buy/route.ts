import { type NextRequest } from "next/server";
import {
  BUY_FEE_BPS,
  JUP_QUOTE,
  JUP_SWAP,
  SHIT_FEE_ATA,
  SHIT_MINT,
  SOL_MINT,
} from "@/lib/buy-fee";

export const dynamic = "force-dynamic";

/**
 * GET /api/buy/quote?amountLamports=100000000
 * Quote SOL → $SHIT with platform fee to treasury ATA.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const amountLamports = sp.get("amountLamports") || "100000000"; // 0.1 SOL
  const slippageBps = sp.get("slippageBps") || "100";

  const url = new URL(JUP_QUOTE);
  url.searchParams.set("inputMint", SOL_MINT);
  url.searchParams.set("outputMint", SHIT_MINT);
  url.searchParams.set("amount", amountLamports);
  url.searchParams.set("slippageBps", slippageBps);
  url.searchParams.set("platformFeeBps", String(BUY_FEE_BPS));
  // OnlyToken2022 false — standard SPL

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        ...(process.env.JUP_API_KEY
          ? { "x-api-key": process.env.JUP_API_KEY }
          : {}),
      },
      next: { revalidate: 15 },
    });
    const data = await res.json();
    if (!res.ok) {
      return Response.json(
        { error: data?.error || data?.message || "Quote failed", data },
        { status: res.status }
      );
    }
    return Response.json({
      quote: data,
      feeBps: BUY_FEE_BPS,
      feeAccount: SHIT_FEE_ATA,
      inputMint: SOL_MINT,
      outputMint: SHIT_MINT,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

/**
 * POST /api/buy/swap
 * Body: { quoteResponse, userPublicKey }
 * Returns serialized swap tx with feeAccount attached.
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

    const res = await fetch(JUP_SWAP, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(process.env.JUP_API_KEY
          ? { "x-api-key": process.env.JUP_API_KEY }
          : {}),
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
        feeAccount: SHIT_FEE_ATA,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return Response.json(
        { error: data?.error || data?.message || "Swap build failed", data },
        { status: res.status }
      );
    }
    return Response.json({
      ...data,
      feeBps: BUY_FEE_BPS,
      feeAccount: SHIT_FEE_ATA,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
