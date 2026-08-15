import { DAY_STAKE_AMOUNT } from "@/lib/day-game";
import { SHIT_MINT, TREASURY_ADDRESS, shitToRaw } from "@/lib/shit-token";
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
 * POST { wallet } → { transaction: base64 } unsigned transfer 1000 SHIT → treasury
 * Rejects early if wallet has &lt; 1000 $TOKENSHIT.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const wallet = String(body.wallet || "").trim();
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

    const { PublicKey, Transaction } = await import("@solana/web3.js");
    const {
      createTransferCheckedInstruction,
      getAssociatedTokenAddress,
      createAssociatedTokenAccountIdempotentInstruction,
      TOKEN_2022_PROGRAM_ID,
    } = await import("@solana/spl-token");

    const owner = new PublicKey(wallet);
    const treasury = new PublicKey(TREASURY_ADDRESS);
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
      treasury,
      true,
      TOKEN_2022_PROGRAM_ID
    );

    const latest = await rpc<{
      value: { blockhash: string; lastValidBlockHeight: number };
    }>("getLatestBlockhash", [{ commitment: "confirmed" }]);

    const tx = new Transaction();
    tx.recentBlockhash = latest.value.blockhash;
    tx.feePayer = owner;

    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        owner,
        toAta,
        treasury,
        mint,
        TOKEN_2022_PROGRAM_ID
      )
    );
    tx.add(
      createTransferCheckedInstruction(
        fromAta,
        mint,
        toAta,
        owner,
        amount,
        decimals,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    const b64 = Buffer.from(serialized).toString("base64");

    return Response.json({
      transaction: b64,
      amount: DAY_STAKE_AMOUNT,
      balance,
      mint: SHIT_MINT,
      treasury: TREASURY_ADDRESS,
      blockhash: latest.value.blockhash,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
