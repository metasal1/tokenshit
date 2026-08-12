import { type NextRequest } from "next/server";
import {
  GLOBAL_TREASURY_DAILY_DROP,
  SHIT_DECIMALS,
  SHIT_MINT,
  TREASURY_ADDRESS,
  shitToRaw,
} from "@/lib/shit-token";
import {
  hasDroppedToday,
  recordDrop,
  buildDropSchedule,
} from "@/lib/treasury-drop";
import {
  getTreasuryBalances,
  loadTreasuryKeypair,
  rpc,
} from "@/lib/treasury";

export const dynamic = "force-dynamic";

const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

/**
 * POST /api/treasury/drop
 * Cron at UTC 00:00:
 *   1) Mint 1M $TOKENSHIT to treasury if mint authority = treasury key
 *   2) Record drop for UI
 *
 * Auth: Authorization: Bearer CRON_SECRET  (or x-cron-secret)
 * Body: { amount?, force?, execute?: boolean (default true), signature?, note? }
 */
export async function POST(request: NextRequest) {
  const secret =
    process.env.CRON_SECRET ||
    process.env.TREASURY_DROP_SECRET ||
    process.env.HERMES_CRON_SECRET ||
    "";
  const auth = request.headers.get("authorization") || "";
  const headerSecret =
    request.headers.get("x-cron-secret") ||
    request.headers.get("x-treasury-drop-secret") ||
    "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const provided = bearer || headerSecret;

  if (!secret) {
    return Response.json(
      { error: "CRON_SECRET not configured on server" },
      { status: 503 }
    );
  }
  if (!provided || provided !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const amount = Number(body.amount ?? GLOBAL_TREASURY_DAILY_DROP);
    const force = Boolean(body.force);
    const execute = body.execute !== false; // default true
    const note = body.note ? String(body.note) : "daily_utc0";
    const now = new Date();
    const dropAmt = Number.isFinite(amount)
      ? amount
      : GLOBAL_TREASURY_DAILY_DROP;

    if (!force && (await hasDroppedToday(now))) {
      return Response.json(
        {
          ok: false,
          error: "Already recorded drop for this UTC day",
          schedule: buildDropSchedule(now),
        },
        { status: 409 }
      );
    }

    let signature: string | null = body.signature
      ? String(body.signature)
      : null;
    let executed = false;
    let executeError: string | null = null;
    let balBefore: number | null = null;
    let balAfter: number | null = null;

    if (execute && !signature) {
      try {
        const bal = await getTreasuryBalances();
        balBefore = bal.shit;
        signature = await mintShitToTreasury(dropAmt);
        executed = true;
        const bal2 = await getTreasuryBalances().catch(() => null);
        balAfter = bal2?.shit ?? null;
      } catch (e) {
        executeError = e instanceof Error ? e.message : String(e);
        // Mint frozen / wrong authority — still record UI drop so countdown resets
        // (manual top-ups / external funder). Cron stays green.
        const bal2 = await getTreasuryBalances().catch(() => null);
        balAfter = bal2?.shit ?? balBefore;
        executed = false;
      }
    }

    const { utcDay } = await recordDrop({
      amount: dropAmt,
      signature,
      note: executeError ? `${note}|err:${executeError.slice(0, 80)}` : note,
      at: now,
    });

    return Response.json({
      ok: true,
      utcDay,
      amount: dropAmt,
      signature,
      executed,
      executeError,
      balBefore,
      balAfter,
      treasury: TREASURY_ADDRESS,
      schedule: buildDropSchedule(now),
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  const now = new Date();
  const bal = await getTreasuryBalances().catch(() => null);
  return Response.json({
    dropAmount: GLOBAL_TREASURY_DAILY_DROP,
    schedule: buildDropSchedule(now),
    treasury: TREASURY_ADDRESS,
    balance: bal?.shit ?? null,
    endpoint: "POST /api/treasury/drop",
    auth: "Bearer CRON_SECRET",
    execute: "mints to treasury when mint authority matches TREASURY_SECRET_JSON",
  });
}

/** Mint amountWhole TOKENSHIT into treasury ATA (Token-2022) */
async function mintShitToTreasury(amountWhole: number): Promise<string> {
  const {
    Connection,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
  } = await import("@solana/web3.js");
  const {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountIdempotentInstruction,
    createMintToCheckedInstruction,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } = await import("@solana/spl-token");

  const payer = loadTreasuryKeypair();
  const RPC =
    process.env.SOLANA_RPC_URL ||
    process.env.HELIUS_RPC_URL ||
    "https://viviyan-bkj12u-fast-mainnet.helius-rpc.com";
  const conn = new Connection(RPC, "confirmed");
  const mint = new PublicKey(SHIT_MINT);
  const TOKEN_2022_PROGRAM_ID = new PublicKey(TOKEN_2022);

  // Verify mint authority is our key
  const mintInfo = await rpc<{
    value: {
      data: {
        parsed: {
          info: {
            mintAuthority: string | null;
            decimals: number;
          };
        };
      };
    };
  }>("getAccountInfo", [SHIT_MINT, { encoding: "jsonParsed" }]);

  const authority =
    mintInfo?.value?.data?.parsed?.info?.mintAuthority || null;
  if (!authority || authority !== payer.publicKey.toBase58()) {
    throw new Error(
      `Mint authority is ${authority || "null"} — cannot mint with treasury key ${payer.publicKey.toBase58()}`
    );
  }

  const ata = await getAssociatedTokenAddress(
    mint,
    payer.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const raw = shitToRaw(amountWhole);
  const decimals =
    mintInfo?.value?.data?.parsed?.info?.decimals ?? SHIT_DECIMALS;

  const tx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      payer.publicKey,
      ata,
      payer.publicKey,
      mint,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    ),
    createMintToCheckedInstruction(
      mint,
      ata,
      payer.publicKey,
      raw,
      decimals,
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );

  const signature = await sendAndConfirmTransaction(conn, tx, [payer], {
    commitment: "confirmed",
  });
  return signature;
}
