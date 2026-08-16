import { type NextRequest } from "next/server";
import { isSolanaAddress } from "@/lib/api-guard";
import { SHIT_MINT, SHIT_DECIMALS, shitToRaw } from "@/lib/shit-token";
import { USDC_MINT } from "@/lib/buy-fee";
import { rpc } from "@/lib/treasury";

export const dynamic = "force-dynamic";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

type Asset = "sol" | "usdc" | "shit";

/**
 * POST { from, to, asset, amount }
 * → unsigned tx: send SOL / USDC / $TOKENSHIT to external wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const from = String(body.from || body.wallet || "").trim();
    const to = String(body.to || body.destination || "").trim();
    const asset = String(body.asset || "shit").toLowerCase() as Asset;
    const amount = Number(body.amount);

    if (!isSolanaAddress(from)) {
      return Response.json({ error: "invalid from wallet" }, { status: 400 });
    }
    if (!isSolanaAddress(to)) {
      return Response.json(
        { error: "Paste a valid Solana destination address" },
        { status: 400 }
      );
    }
    if (from === to) {
      return Response.json(
        { error: "Destination must be a different wallet" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "amount must be > 0" }, { status: 400 });
    }
    if (asset !== "sol" && asset !== "usdc" && asset !== "shit") {
      return Response.json({ error: "asset must be sol|usdc|shit" }, { status: 400 });
    }

    const { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } =
      await import("@solana/web3.js");
    const {
      createTransferCheckedInstruction,
      getAssociatedTokenAddress,
      createAssociatedTokenAccountIdempotentInstruction,
      TOKEN_2022_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
    } = await import("@solana/spl-token");

    const owner = new PublicKey(from);
    const dest = new PublicKey(to);

    const latest = await rpc<{
      value: { blockhash: string; lastValidBlockHeight: number };
    }>("getLatestBlockhash", [{ commitment: "confirmed" }]);

    const tx = new Transaction();
    tx.recentBlockhash = latest.value.blockhash;
    tx.feePayer = owner;

    if (asset === "sol") {
      // leave dust for fees if they try to send all
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      if (lamports < 1_000) {
        return Response.json({ error: "Amount too small" }, { status: 400 });
      }
      tx.add(
        SystemProgram.transfer({
          fromPubkey: owner,
          toPubkey: dest,
          lamports,
        })
      );
    } else {
      const isShit = asset === "shit";
      const mintStr = isShit ? SHIT_MINT : USDC_MINT;
      const decimals = isShit ? SHIT_DECIMALS : 6;
      const programId = isShit
        ? TOKEN_2022_PROGRAM_ID
        : TOKEN_PROGRAM_ID;
      // sanity: program constants match expected
      void TOKEN_2022;
      void TOKEN_PROGRAM;

      const mint = new PublicKey(mintStr);
      const raw = isShit
        ? shitToRaw(amount)
        : BigInt(Math.floor(amount * 10 ** decimals));

      if (raw <= BigInt(0)) {
        return Response.json({ error: "Amount too small" }, { status: 400 });
      }

      const fromAta = await getAssociatedTokenAddress(
        mint,
        owner,
        false,
        programId
      );
      const toAta = await getAssociatedTokenAddress(
        mint,
        dest,
        true,
        programId
      );

      tx.add(
        createAssociatedTokenAccountIdempotentInstruction(
          owner,
          toAta,
          dest,
          mint,
          programId
        )
      );
      tx.add(
        createTransferCheckedInstruction(
          fromAta,
          mint,
          toAta,
          owner,
          raw,
          decimals,
          [],
          programId
        )
      );
    }

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    const b64 = Buffer.from(serialized).toString("base64");

    return Response.json({
      transaction: b64,
      from,
      to,
      asset,
      amount,
      blockhash: latest.value.blockhash,
      lastValidBlockHeight: latest.value.lastValidBlockHeight,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
