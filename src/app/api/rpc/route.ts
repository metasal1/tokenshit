import { type NextRequest } from "next/server";
import { getClientIp, rateLimitIp } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

/**
 * Same-origin Solana JSON-RPC proxy.
 * Browser never sees the dedicated Helius URL — only /api/rpc.
 * Allowlist methods only (no admin/DAS abuse).
 */
const UPSTREAM =
  process.env.SOLANA_RPC_URL ||
  process.env.HELIUS_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

const ALLOWED = new Set([
  "getHealth",
  "getSlot",
  "getBlockHeight",
  "getLatestBlockhash",
  "getRecentPrioritizationFees",
  "getBalance",
  "getAccountInfo",
  "getMultipleAccounts",
  "getTokenAccountBalance",
  "getTokenAccountsByOwner",
  "getParsedTokenAccountsByOwner",
  "getSignatureStatuses",
  "getSignaturesForAddress",
  "getTransaction",
  "getFeeForMessage",
  "sendTransaction",
  "simulateTransaction",
  "getMinimumBalanceForRentExemption",
  "isBlockhashValid",
  "getEpochInfo",
  "getVersion",
]);

export async function POST(req: NextRequest) {
  const limited = await rateLimitIp({
    ip: getClientIp(req),
    bucket: "rpc_proxy",
    limit: 400,
    windowHours: 1,
  });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
      { status: 400 }
    );
  }

  const batch = Array.isArray(body) ? body : [body];
  if (batch.length > 20) {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32600, message: "Batch too large" },
        id: null,
      },
      { status: 400 }
    );
  }

  for (const item of batch) {
    const method =
      item && typeof item === "object"
        ? String((item as { method?: string }).method || "")
        : "";
    if (!ALLOWED.has(method)) {
      return Response.json(
        {
          jsonrpc: "2.0",
          error: { code: -32601, message: `Method not allowed: ${method}` },
          id:
            item && typeof item === "object"
              ? (item as { id?: unknown }).id ?? null
              : null,
        },
        { status: 403 }
      );
    }
  }

  try {
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32000, message: "RPC upstream unavailable" },
        id: null,
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  return Response.json(
    { ok: true, proxy: true, methods: [...ALLOWED].sort() },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
