import { type NextRequest } from "next/server";
import { SHIT_DECIMALS, SHIT_MINT, SHIT_SYMBOL } from "@/lib/shit-token";
import { rpc } from "@/lib/treasury";

export const dynamic = "force-dynamic";

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
    const result = await rpc<{
      value: {
        account?: {
          data?: {
            parsed?: {
              info?: {
                tokenAmount?: { amount?: string; decimals?: number };
              };
            };
          };
        };
      }[];
    }>("getTokenAccountsByOwner", [
      address,
      { mint: SHIT_MINT },
      { encoding: "jsonParsed", commitment: "confirmed" },
    ]);
    const accounts = result?.value || [];
    let raw = 0;
    let decimals = SHIT_DECIMALS;
    for (const a of accounts) {
      const info = a?.account?.data?.parsed?.info?.tokenAmount;
      if (!info) continue;
      raw += Number(info.amount || 0);
      if (typeof info.decimals === "number") decimals = info.decimals;
    }

    // DAS fallback if empty (index lag). Never 500 — 0 is a valid balance.
    if (raw === 0) {
      try {
        const helius =
          process.env.HELIUS_RPC_URL ||
          process.env.SOLANA_RPC_URL ||
          "";
        if (helius) {
          const r2 = await fetch(helius, {
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
      } catch {
        /* keep 0 */
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
