import { type NextRequest } from "next/server";
import { SHIT_DECIMALS, SHIT_MINT, SHIT_SYMBOL } from "@/lib/shit-token";

export const dynamic = "force-dynamic";

const HELIUS =
  process.env.HELIUS_RPC_URL ||
  "https://viviyan-bkj12u-fast-mainnet.helius-rpc.com";
const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

/**
 * GET /api/wallet/shit-balance?address=
 * TOKENSHIT (Token-2022) ui balance for a wallet.
 */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address") || "";
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return Response.json({ error: "Invalid address" }, { status: 400 });
  }

  try {
    // 1) Prefer getTokenAccountsByOwner for Token-2022 mint
    const res = await fetch(HELIUS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          address,
          { mint: SHIT_MINT },
          { encoding: "jsonParsed", commitment: "confirmed" },
        ],
      }),
      cache: "no-store",
    });
    const json = await res.json();
    const accounts = json?.result?.value || [];
    let raw = 0;
    let decimals = SHIT_DECIMALS;
    for (const a of accounts) {
      const info = a?.account?.data?.parsed?.info?.tokenAmount;
      if (!info) continue;
      raw += Number(info.amount || 0);
      if (typeof info.decimals === "number") decimals = info.decimals;
    }

    // 2) Fallback DAS if empty (sometimes indexes lag)
    if (raw === 0) {
      const r2 = await fetch(HELIUS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "getAssetsByOwner",
          params: {
            ownerAddress: address,
            displayOptions: { showFungible: true, showNativeBalance: false },
          },
        }),
        cache: "no-store",
      });
      const d2 = await r2.json();
      const items = d2?.result?.items || [];
      for (const item of items) {
        if (item?.id !== SHIT_MINT) continue;
        const info = item.token_info || {};
        raw = Number(info.balance || 0);
        decimals = info.decimals ?? SHIT_DECIMALS;
        break;
      }
    }

    const ui = raw / Math.pow(10, decimals);
    return Response.json(
      {
        mint: SHIT_MINT,
        symbol: SHIT_SYMBOL,
        decimals,
        raw: String(raw),
        balance: ui,
        program: TOKEN_2022,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=15",
        },
      }
    );
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
