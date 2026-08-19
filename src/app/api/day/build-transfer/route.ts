import { DAY_STAKE_AMOUNT } from "@/lib/day-game";
import {
  SHIT_MINT,
  PLAY_POT_ADDRESS,
  shitToRaw,
} from "@/lib/shit-token";
import { isSolanaAddress } from "@/lib/api-guard";
import { rpc } from "@/lib/treasury";

export const dynamic = "force-dynamic";

async function shitBalanceUi(owner: string): Promise<number> {
  const res = await rpc<{
    value: Array<{
      account?: {
        data?: {
          parsed?: {
            info?: {
              tokenAmount?: { amount?: string; decimals?: number };
            };
          };
        };
      };
    }>;
  }>("getTokenAccountsByOwner", [
    owner,
    { mint: SHIT_MINT },
    { encoding: "jsonParsed", commitment: "confirmed" },
  ]);
  let raw = 0;
  let decimals = 6;
  for (const a of res?.value || []) {
    const ta = a?.account?.data?.parsed?.info?.tokenAmount;
    if (!ta) continue;
    raw += Number(ta.amount || 0);
    if (typeof ta.decimals === "number") decimals = ta.decimals;
  }
  return raw / 10 ** decimals;
}

/**
 * POST { wallet } → unsigned transfer 1000 SHIT → play pot escrow
 * Versioned tx (v0) — Privy embedded signs these more reliably than legacy.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const wallet = String(body.wallet || "").trim();
    const memoSide = String(body.side || "").trim();
    const memoSymbol = String(body.symbol || body.assetId || "").trim();
    if (!isSolanaAddress(wallet)) {
      return Response.json({ error: "invalid wallet" }, { status: 400 });
    }

    const balance = await shitBalanceUi(wallet);
    if (!(balance >= DAY_STAKE_AMOUNT)) {
      return Response.json(
        {
          error: `Need ${DAY_STAKE_AMOUNT.toLocaleString()} $TOKENSHIT to play (you have ${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })})`,
          code: "insufficient_shit",
          need: DAY_STAKE_AMOUNT,
          have: balance,
        },
        { status: 400 }
      );
    }

    // SOL check — sponsorship off; user must self-pay
    const balRes = await rpc<{ value: number }>("getBalance", [
      wallet,
      { commitment: "confirmed" },
    ]);
    const lamports = Number(balRes?.value || 0);
    const sol = lamports / 1e9;
    if (sol < 0.0015) {
      return Response.json(
        {
          error: `Need ~0.01 SOL for fees (you have ${sol.toFixed(4)}). Sponsorship is off — add SOL, then retry.`,
          code: "insufficient_sol",
          sol,
        },
        { status: 400 }
      );
    }

    const {
      PublicKey,
      TransactionMessage,
      VersionedTransaction,
      SystemProgram,
      ComputeBudgetProgram,
    } = await import("@solana/web3.js");
    const { memoInstruction, playMemo } = await import("@/lib/tx-memo");
    const {
      createTransferCheckedInstruction,
      getAssociatedTokenAddress,
      createAssociatedTokenAccountIdempotentInstruction,
      TOKEN_2022_PROGRAM_ID,
    } = await import("@solana/spl-token");

    const owner = new PublicKey(wallet);
    const pot = new PublicKey(PLAY_POT_ADDRESS);
    const mint = new PublicKey(SHIT_MINT);
    const amount = shitToRaw(DAY_STAKE_AMOUNT);
    const decimals = 6;

    const fromAta = await getAssociatedTokenAddress(
      mint,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    const toAta = await getAssociatedTokenAddress(
      mint,
      pot,
      true,
      TOKEN_2022_PROGRAM_ID
    );

    const latest = await rpc<{
      value: { blockhash: string; lastValidBlockHeight: number };
    }>("getLatestBlockhash", [{ commitment: "confirmed" }]);

    const ixs = [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 140_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
      createAssociatedTokenAccountIdempotentInstruction(
        owner,
        toAta,
        pot,
        mint,
        TOKEN_2022_PROGRAM_ID
      ),
      createTransferCheckedInstruction(
        fromAta,
        mint,
        toAta,
        owner,
        amount,
        decimals,
        [],
        TOKEN_2022_PROGRAM_ID
      ),
      memoInstruction(playMemo(memoSide, memoSymbol), [owner]),
    ];

    // silence unused import if tree-shaken weirdly
    void SystemProgram;

    const msg = new TransactionMessage({
      payerKey: owner,
      recentBlockhash: latest.value.blockhash,
      instructions: ixs,
    }).compileToV0Message();

    const vtx = new VersionedTransaction(msg);
    const serialized = vtx.serialize();
    const b64 = Buffer.from(serialized).toString("base64");

    return Response.json({
      transaction: b64,
      version: 0,
      amount: DAY_STAKE_AMOUNT,
      balance,
      sol,
      mint: SHIT_MINT,
      pot: PLAY_POT_ADDRESS,
      blockhash: latest.value.blockhash,
      lastValidBlockHeight: latest.value.lastValidBlockHeight,
      memo: playMemo(memoSide, memoSymbol),
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
