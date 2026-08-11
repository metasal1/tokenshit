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
}> {
  const [solBal, tokenAccs] = await Promise.all([
    rpc<{ value: number }>("getBalance", [TREASURY_ADDRESS]),
    rpc<{
      value: {
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
  for (const row of tokenAccs?.value || []) {
    const ta = row.account?.data?.parsed?.info?.tokenAmount;
    if (!ta) continue;
    shitRaw += BigInt(ta.amount || "0");
    if (ta.uiAmount != null) shitUi += ta.uiAmount;
    else shitUi = rawToShit(shitRaw);
  }

  const lamports = solBal?.value ?? 0;
  return {
    address: TREASURY_ADDRESS,
    mint: SHIT_MINT,
    shit: shitUi || rawToShit(shitRaw),
    shitRaw: shitRaw.toString(),
    sol: lamports / 1e9,
    solLamports: lamports,
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

/** Transfer whole $SHIT tokens from treasury → recipient wallet */
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
    createTransferInstruction,
    getAccount,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } = await import("@solana/spl-token");

  const payer = loadTreasuryKeypair();
  const conn = new Connection(RPC, "confirmed");
  const mint = new PublicKey(SHIT_MINT);
  const toOwner = new PublicKey(recipient);
  const raw = shitToRaw(amountWhole);

  const fromAta = await getAssociatedTokenAddress(mint, payer.publicKey);
  const toAta = await getAssociatedTokenAddress(mint, toOwner);

  // Ensure treasury has balance
  const fromAcc = await getAccount(conn, fromAta).catch(() => null);
  if (!fromAcc || fromAcc.amount < raw) {
    throw new Error(
      `Treasury insufficient $SHIT (need ${amountWhole}, have ${fromAcc ? rawToShit(fromAcc.amount) : 0})`
    );
  }

  const ix = [
    createAssociatedTokenAccountIdempotentInstruction(
      payer.publicKey,
      toAta,
      toOwner,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    ),
    createTransferInstruction(fromAta, toAta, payer.publicKey, raw),
  ];

  const tx = new Transaction().add(...ix);
  const signature = await sendAndConfirmTransaction(conn, tx, [payer], {
    commitment: "confirmed",
  });

  return { signature, amount: amountWhole };
}
