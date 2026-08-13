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
import { getClientIp, isSolanaAddress, rateLimitIp } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

const MAX_BUY_LAMPORTS = 50 * 1e9;
const MIN_BUY_LAMPORTS = 1_000_000;

async function buildSwap(opts: {
  quoteResponse: unknown;
  userPublicKey: string;
  feeAccount?: string | null;
  asLegacyTransaction: boolean;
}) {
  const payload: Record<string, unknown> = {
    quoteResponse: opts.quoteResponse,
    userPublicKey: opts.userPublicKey,
    wrapAndUnwrapSol: true,
    dynamicComputeUnitLimit: true,
    prioritizationFeeLamports: 100_000,
    asLegacyTransaction: opts.asLegacyTransaction,
  };
  if (opts.feeAccount) payload.feeAccount = opts.feeAccount;

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
      error: String(data?.error || data?.message || text.slice(0, 200)),
      data,
    };
  }
  return { ok: true as const, data };
}

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
  const amountLamports = sp.get("amountLamports") || "100000000";
  if (!/^\d+$/.test(amountLamports)) {
    return Response.json({ error: "invalid amountLamports" }, { status: 400 });
  }
  const n = Number(amountLamports);
  if (n < MIN_BUY_LAMPORTS || n > MAX_BUY_LAMPORTS) {
    return Response.json(
      {
        error: `amountLamports must be ${MIN_BUY_LAMPORTS}–${MAX_BUY_LAMPORTS}`,
      },
      { status: 400 }
    );
  }
  const slippageBps = sp.get("slippageBps") || "150";
  const withFee = sp.get("fee") === "1";

  const url = new URL(JUP_QUOTE);
  url.searchParams.set("inputMint", SOL_MINT);
  url.searchParams.set("outputMint", SHIT_MINT);
  url.searchParams.set("amount", amountLamports);
  url.searchParams.set("slippageBps", slippageBps);
  url.searchParams.set("maxAccounts", "40");
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
        const u2 = new URL(JUP_QUOTE);
        u2.searchParams.set("inputMint", SOL_MINT);
        u2.searchParams.set("outputMint", SHIT_MINT);
        u2.searchParams.set("amount", amountLamports);
        u2.searchParams.set("slippageBps", slippageBps);
        u2.searchParams.set("maxAccounts", "40");
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
    if (inMint && inMint !== SOL_MINT) {
      return Response.json({ error: "buy input must be SOL" }, { status: 400 });
    }
    if (outMint && outMint !== SHIT_MINT) {
      return Response.json(
        { error: "buy output must be TOKENSHIT" },
        { status: 400 }
      );
    }

    const useFee =
      body.fee === true ||
      body.fee === 1 ||
      (body.feeBps != null && Number(body.feeBps) > 0);

    const feeAccount = useFee ? body.feeAccount || SHIT_FEE_ATA : null;
    // Prefer versioned, then legacy (Privy prepare is picky)
    for (const legacy of [false, true]) {
      const built = await buildSwap({
        quoteResponse,
        userPublicKey,
        feeAccount,
        asLegacyTransaction: legacy,
      });
      if (built.ok) {
        return Response.json({
          ...built.data,
          feeBps: useFee ? BUY_FEE_BPS : 0,
          feeAccount: useFee ? SHIT_FEE_ATA : null,
          legacy,
        });
      }
      // fee account often fails — retry without fee
      if (useFee) {
        const bare = await buildSwap({
          quoteResponse,
          userPublicKey,
          feeAccount: null,
          asLegacyTransaction: legacy,
        });
        if (bare.ok) {
          return Response.json({
            ...bare.data,
            feeBps: 0,
            feeAccount: null,
            legacy,
          });
        }
      }
    }

    return Response.json(
      { error: "Could not build buy transaction — try again" },
      { status: 502 }
    );
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
