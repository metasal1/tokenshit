import {
  SHIT_MINT,
  TREASURY_ADDRESS,
  rawToShit,
  shitToRaw,
} from "@/lib/shit-token";

const RPC =
  process.env.SOLANA_RPC_URL ||
  process.env.HELIUS_RPC_URL ||
  "https://viviyan-bkj12u-fast-mainnet.helius-rpc.com";

/** Token-2022 program (mint is Token-2022, not classic SPL) */
const TOKEN_2022_PROGRAM_ID_STR = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

export async function rpc<T = unknown>(
  method: string,
  params: unknown[]
): Promise<T> {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result as T;
}

export async function getTreasuryBalances(): Promise<{
  address: string;
  mint: string;
  shit: number;
  shitRaw: string;
  sol: number;
  solLamports: number;
  ata?: string;
}> {
  const [solBal, tokenAccs] = await Promise.all([
    rpc<{ value: number }>("getBalance", [TREASURY_ADDRESS]),
    rpc<{
      value: {
        pubkey?: string;
        account: {
          data: {
            parsed: {
              info: {
                tokenAmount: {
                  amount: string;
                  decimals: number;
                  uiAmount: number | null;
                };
              };
            };
          };
        };
      }[];
    }>("getTokenAccountsByOwner", [
      TREASURY_ADDRESS,
      { mint: SHIT_MINT },
      { encoding: "jsonParsed" },
    ]),
  ]);

  let shitRaw = BigInt(0);
  let shitUi = 0;
  let ata: string | undefined;
  for (const row of tokenAccs?.value || []) {
    const ta = row.account?.data?.parsed?.info?.tokenAmount;
    if (!ta) continue;
    shitRaw += BigInt(ta.amount || "0");
    if (ta.uiAmount != null) shitUi += ta.uiAmount;
    else shitUi = rawToShit(shitRaw);
    if (row.pubkey) ata = row.pubkey;
  }

  const lamports = solBal?.value ?? 0;
  return {
    address: TREASURY_ADDRESS,
    mint: SHIT_MINT,
    shit: shitUi || rawToShit(shitRaw),
    shitRaw: shitRaw.toString(),
    sol: lamports / 1e9,
    solLamports: lamports,
    ata,
  };
}

/** Load treasury keypair from TREASURY_SECRET_JSON env (JSON byte array) */
export function loadTreasuryKeypair(): import("@solana/web3.js").Keypair {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Keypair } = require("@solana/web3.js") as typeof import("@solana/web3.js");
  const raw = process.env.TREASURY_SECRET_JSON;
  if (!raw) throw new Error("TREASURY_SECRET_JSON not configured");
  const arr = JSON.parse(raw) as number[];
  if (!Array.isArray(arr) || arr.length !== 64) {
    throw new Error("TREASURY_SECRET_JSON must be 64-byte JSON array");
  }
  return Keypair.fromSecretKey(Uint8Array.from(arr));
}

/** Transfer whole $TOKENSHIT from treasury → recipient (Token-2022) */
export async function sendShitFromTreasury(
  recipient: string,
  amountWhole: number
): Promise<{ signature: string; amount: number }> {
  const {
    Connection,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
  } = await import("@solana/web3.js");
  const {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountIdempotentInstruction,
    createTransferCheckedInstruction,
    getAccount,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } = await import("@solana/spl-token");

  const TOKEN_2022_PROGRAM_ID = new PublicKey(TOKEN_2022_PROGRAM_ID_STR);
  const payer = loadTreasuryKeypair();
  const conn = new Connection(RPC, "confirmed");
  const mint = new PublicKey(SHIT_MINT);
  const toOwner = new PublicKey(recipient);
  const raw = shitToRaw(amountWhole);
  const decimals = 6;

  // Token-2022 ATAs
  const fromAta = await getAssociatedTokenAddress(
    mint,
    payer.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const toAta = await getAssociatedTokenAddress(
    mint,
    toOwner,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const fromAcc = await getAccount(
    conn,
    fromAta,
    "confirmed",
    TOKEN_2022_PROGRAM_ID
  ).catch(() => null);

  if (!fromAcc || fromAcc.amount < raw) {
    // Also surface RPC-listed balance for debugging
    const bal = await getTreasuryBalances().catch(() => null);
    throw new Error(
      `Treasury insufficient $TOKENSHIT (need ${amountWhole}, have ${
        fromAcc ? rawToShit(fromAcc.amount) : 0
      }; rpcUi=${bal?.shit ?? "?"}, ata=${fromAta.toBase58()})`
    );
  }

  const ix = [
    createAssociatedTokenAccountIdempotentInstruction(
      payer.publicKey,
      toAta,
      toOwner,
      mint,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    ),
    createTransferCheckedInstruction(
      fromAta,
      mint,
      toAta,
      payer.publicKey,
      raw,
      decimals,
      [],
      TOKEN_2022_PROGRAM_ID
    ),
  ];

  const tx = new Transaction().add(...ix);
  const signature = await sendAndConfirmTransaction(conn, tx, [payer], {
    commitment: "confirmed",
  });

  return { signature, amount: amountWhole };
}
