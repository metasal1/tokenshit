import { type NextRequest } from "next/server";
import {
  JUP_QUOTE,
  JUP_SWAP,
  SHIT_MINT,
  SOL_MINT,
  USDC_MINT,
  jupHeaders,
} from "@/lib/buy-fee";
import { getClientIp, isSolanaAddress, rateLimitIp } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([SHIT_MINT, SOL_MINT, USDC_MINT]);

function isMint(s: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s) && ALLOWED.has(s);
}

async function jupSwapBuild(opts: {
  quoteResponse: unknown;
  userPublicKey: string;
  asLegacyTransaction: boolean;
}) {
  const payload = {
    quoteResponse: opts.quoteResponse,
    userPublicKey: opts.userPublicKey,
    wrapAndUnwrapSol: true,
    dynamicComputeUnitLimit: true,
    // fixed priority fee (auto object shapes break some wallet prepare paths)
    prioritizationFeeLamports: 100_000,
    asLegacyTransaction: opts.asLegacyTransaction,
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
    return {
      ok: false as const,
      status: 502,
      error: `Jupiter swap non-JSON: ${text.slice(0, 200)}`,
    };
  }
  if (!res.ok || !data.swapTransaction) {
    return {
      ok: false as const,
      status: res.status || 502,
      error: String(
        data?.error || data?.message || text.slice(0, 200) || "swap build failed"
      ),
      data,
    };
  }
  return {
    ok: true as const,
    data: { ...data, legacy: opts.asLegacyTransaction },
  };
}

/**
 * GET /api/swap?inputMint=&outputMint=&amount=&slippageBps=150
 * amount = raw integer (e.g. USDC/TOKENSHIT 6dp: 1 USDC = 1000000)
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = await rateLimitIp({
    ip,
    bucket: "jup_quote",
    limit: 60,
    windowHours: 1,
  });
  if (limited) return limited;

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
  if (amount.length > 15) {
    return Response.json({ error: "amount too large" }, { status: 400 });
  }

  const url = new URL(JUP_QUOTE);
  url.searchParams.set("inputMint", inputMint);
  url.searchParams.set("outputMint", outputMint);
  url.searchParams.set("amount", amount);
  url.searchParams.set("slippageBps", slippageBps);
  // Prefer simpler routes for embedded wallets
  url.searchParams.set("maxAccounts", "40");

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
 * Body: { quoteResponse, userPublicKey, asLegacyTransaction? }
 * Builds versioned first; falls back to legacy for wallet prep compatibility.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limited = await rateLimitIp({
      ip,
      bucket: "jup_swap_build",
      limit: 40,
      windowHours: 1,
    });
    if (limited) return limited;

    const body = await request.json();
    const quoteResponse = body.quoteResponse || body.quote;
    const userPublicKey = String(body.userPublicKey || "");
    // Default legacy so CloseAccount can be stripped for gas sponsorship
    const preferLegacy = body.asLegacyTransaction !== false;

    if (!quoteResponse || !userPublicKey) {
      return Response.json(
        { error: "quoteResponse and userPublicKey required" },
        { status: 400 }
      );
    }
    if (!isSolanaAddress(userPublicKey)) {
      return Response.json({ error: "invalid userPublicKey" }, { status: 400 });
    }

    const inMint = String(
      (quoteResponse as { inputMint?: string }).inputMint || ""
    );
    const outMint = String(
      (quoteResponse as { outputMint?: string }).outputMint || ""
    );
    if (inMint && !ALLOWED.has(inMint)) {
      return Response.json(
        { error: "quote input mint not allowed" },
        { status: 400 }
      );
    }
    if (outMint && !ALLOWED.has(outMint)) {
      return Response.json(
        { error: "quote output mint not allowed" },
        { status: 400 }
      );
    }

    // Try preferred format, then alternate (Privy prepare is picky)
    const order = preferLegacy ? [true, false] : [false, true];
    let lastErr = "swap build failed";
    for (const legacy of order) {
      const built = await jupSwapBuild({
        quoteResponse,
        userPublicKey,
        asLegacyTransaction: legacy,
      });
      if (built.ok) {
        return Response.json(built.data);
      }
      lastErr = built.error;
    }
    return Response.json({ error: lastErr }, { status: 502 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
