import { type NextRequest } from "next/server";
import {
  JUP_QUOTE,
  JUP_SWAP,
  SHIT_MINT,
  SOL_MINT,
  USDC_MINT,
  jupHeaders,
} from "@/lib/buy-fee";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([SHIT_MINT, SOL_MINT, USDC_MINT]);

function isMint(s: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s) && ALLOWED.has(s);
}

/**
 * GET /api/swap?inputMint=&outputMint=&amount=&slippageBps=150
 * amount = raw integer (e.g. USDC/TOKENSHIT 6dp: 1 USDC = 1000000)
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const inputMint = String(sp.get("inputMint") || "");
  const outputMint = String(sp.get("outputMint") || "");
  const amount = String(sp.get("amount") || "");
  const slippageBps = sp.get("slippageBps") || "150";

  if (!isMint(inputMint) || !isMint(outputMint)) {
    return Response.json(
      {
        error:
          "inputMint/outputMint must be SOL, USDC, or TOKENSHIT (allowed mints only)",
      },
      { status: 400 }
    );
  }
  if (inputMint === outputMint) {
    return Response.json({ error: "Same mint" }, { status: 400 });
  }
  if (!/^\d+$/.test(amount) || amount === "0") {
    return Response.json(
      { error: "amount must be positive integer (raw units)" },
      { status: 400 }
    );
  }

  const url = new URL(JUP_QUOTE);
  url.searchParams.set("inputMint", inputMint);
  url.searchParams.set("outputMint", outputMint);
  url.searchParams.set("amount", amount);
  url.searchParams.set("slippageBps", slippageBps);
  // Do NOT set asLegacyTransaction on quote — kills multi-hop USDC↔TOKENSHIT.
  // Legacy is forced on /swap build instead (Privy ALT #5663005).

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
      return Response.json(
        { error: data?.error || data?.message || text.slice(0, 200), data },
        { status: res.status }
      );
    }
    return Response.json({
      quote: data,
      inputMint,
      outputMint,
      amount,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

/**
 * POST /api/swap
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

    const payload = {
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto" as const,
      asLegacyTransaction: true,
    };

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
      return Response.json(
        { error: data?.error || data?.message || text.slice(0, 200), data },
        { status: res.status }
      );
    }
    return Response.json({ ...data, legacy: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
