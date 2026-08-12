import { type NextRequest } from "next/server";
import { SHIT_DECIMALS, SHIT_MINT, SHIT_SYMBOL } from "@/lib/shit-token";
import { USDC_MINT } from "@/lib/buy-fee";

export const dynamic = "force-dynamic";

const HELIUS =
  process.env.HELIUS_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://viviyan-bkj12u-fast-mainnet.helius-rpc.com";

const USDC_DECIMALS = 6;

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(HELIUS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  return res.json();
}

async function tokenUiBalance(
  owner: string,
  mint: string,
  fallbackDecimals: number
): Promise<{ raw: string; ui: number; decimals: number }> {
  const json = await rpc("getTokenAccountsByOwner", [
    owner,
    { mint },
    { encoding: "jsonParsed", commitment: "confirmed" },
  ]);
  const accounts = json?.result?.value || [];
  let raw = 0;
  let decimals = fallbackDecimals;
  for (const a of accounts) {
    const info = a?.account?.data?.parsed?.info?.tokenAmount;
    if (!info) continue;
    raw += Number(info.amount || 0);
    if (typeof info.decimals === "number") decimals = info.decimals;
  }
  return { raw: String(raw), ui: raw / 10 ** decimals, decimals };
}

/**
 * GET /api/wallet/balances?address=
 * SOL + USDC + TOKENSHIT ui balances for swap desk.
 */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address") || "";
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return Response.json({ error: "Invalid address" }, { status: 400 });
  }

  try {
    const [balJson, usdc, shit] = await Promise.all([
      rpc("getBalance", [address, { commitment: "confirmed" }]),
      tokenUiBalance(address, USDC_MINT, USDC_DECIMALS),
      tokenUiBalance(address, SHIT_MINT, SHIT_DECIMALS),
    ]);
    const lamports = Number(balJson?.result?.value ?? 0);
    const sol = lamports / 1e9;

    return Response.json(
      {
        address,
        sol,
        lamports: String(lamports),
        usdc: usdc.ui,
        usdcRaw: usdc.raw,
        shit: shit.ui,
        shitRaw: shit.raw,
        symbol: SHIT_SYMBOL,
        mints: {
          usdc: USDC_MINT,
          shit: SHIT_MINT,
        },
      },
      {
        headers: { "Cache-Control": "private, max-age=10" },
      }
    );
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
