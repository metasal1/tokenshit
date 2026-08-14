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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Confirm a signature until finalized/confirmed, or block height exceeds.
 * Returns status without throwing on "not found yet".
 */
async function waitForSig(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conn: any,
  signature: string,
  lastValidBlockHeight: number,
  timeoutMs = 45_000
): Promise<"confirmed" | "expired" | "timeout" | "failed"> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const st = await conn.getSignatureStatuses([signature], {
        searchTransactionHistory: true,
      });
      const v = st?.value?.[0];
      if (v?.err) return "failed";
      if (
        v?.confirmationStatus === "confirmed" ||
        v?.confirmationStatus === "finalized"
      ) {
        return "confirmed";
      }
    } catch {
      /* rpc blip */
    }
    try {
      const h = await conn.getBlockHeight("confirmed");
      if (typeof h === "number" && h > lastValidBlockHeight) {
        // one last status check — sometimes lands after height tick
        const st = await conn.getSignatureStatuses([signature], {
          searchTransactionHistory: true,
        });
        const v = st?.value?.[0];
        if (
          v &&
          !v.err &&
          (v.confirmationStatus === "confirmed" ||
            v.confirmationStatus === "finalized")
        ) {
          return "confirmed";
        }
        return "expired";
      }
    } catch {
      /* */
    }
    await sleep(900);
  }
  // timeout — check once more
  try {
    const st = await conn.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    });
    const v = st?.value?.[0];
    if (v?.err) return "failed";
    if (
      v?.confirmationStatus === "confirmed" ||
      v?.confirmationStatus === "finalized"
    ) {
      return "confirmed";
    }
  } catch {
    /* */
  }
  return "timeout";
}

/**
 * Transfer whole $TOKENSHIT from treasury → recipient (Token-2022).
 *
 * Durable path for CF Workers:
 * - fresh blockhash each attempt
 * - sendRawTransaction (skipPreflight) so we don't burn the whole blockhash
 *   window inside preflight
 * - poll confirm vs lastValidBlockHeight
 * - retry with NEW blockhash on expiry (never double-finalize same sig)
 */
export async function sendShitFromTreasury(
  recipient: string,
  amountWhole: number
): Promise<{ signature: string; amount: number }> {
  const { isBlacklistedWallet, treasurySendsAllowed, maxSinglePayoutWhole } =
    await import("@/lib/security");

  const gate = treasurySendsAllowed();
  if (!gate.ok) {
    throw new Error(`Treasury sends paused (${gate.reason})`);
  }
  if (isBlacklistedWallet(recipient)) {
    throw new Error("Recipient wallet blocked");
  }
  const cap = maxSinglePayoutWhole();
  if (!Number.isFinite(amountWhole) || amountWhole <= 0) {
    throw new Error("Invalid amount");
  }
  if (amountWhole > cap) {
    throw new Error(
      `Amount ${amountWhole} exceeds max single payout ${cap} (set TREASURY_MAX_SINGLE to raise)`
    );
  }

  const { Connection, PublicKey, Transaction } = await import(
    "@solana/web3.js"
  );
  const {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountIdempotentInstruction,
    createTransferCheckedInstruction,
    getAccount,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } = await import("@solana/spl-token");

  const TOKEN_2022_PROGRAM_ID = new PublicKey(TOKEN_2022_PROGRAM_ID_STR);
  const payer = loadTreasuryKeypair();
  const conn = new Connection(RPC, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60_000,
    disableRetryOnRateLimit: false,
  });
  const mint = new PublicKey(SHIT_MINT);
  const toOwner = new PublicKey(recipient);
  const raw = shitToRaw(amountWhole);
  const decimals = 6;

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

  const MAX_ATTEMPTS = 4;
  let lastErr: Error | null = null;
  const triedSigs: string[] = [];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const latest = await conn.getLatestBlockhash("confirmed");
      const tx = new Transaction().add(...ix);
      tx.feePayer = payer.publicKey;
      tx.recentBlockhash = latest.blockhash;
      tx.sign(payer);

      const rawTx = tx.serialize();
      const signature = await conn.sendRawTransaction(rawTx, {
        skipPreflight: true,
        maxRetries: 3,
        preflightCommitment: "confirmed",
      });
      triedSigs.push(signature);

      const status = await waitForSig(
        conn,
        signature,
        latest.lastValidBlockHeight,
        48_000
      );

      if (status === "confirmed") {
        return { signature, amount: amountWhole };
      }

      if (status === "failed") {
        // On-chain program error — don't burn more attempts with same issue
        throw new Error(`Treasury send failed on-chain (${signature})`);
      }

      // expired or timeout — check if ANY prior sig landed before retrying
      for (const sig of triedSigs) {
        try {
          const st = await conn.getSignatureStatuses([sig], {
            searchTransactionHistory: true,
          });
          const v = st?.value?.[0];
          if (
            v &&
            !v.err &&
            (v.confirmationStatus === "confirmed" ||
              v.confirmationStatus === "finalized")
          ) {
            return { signature: sig, amount: amountWhole };
          }
        } catch {
          /* */
        }
      }

      lastErr = new Error(
        `Signature ${signature} ${status === "expired" ? "expired: block height exceeded" : "confirm timeout"} (attempt ${attempt}/${MAX_ATTEMPTS})`
      );
      // brief backoff then fresh blockhash
      await sleep(400 * attempt);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      // if we already have a confirmed sig in the bag, return it
      for (const sig of triedSigs) {
        try {
          const st = await conn.getSignatureStatuses([sig], {
            searchTransactionHistory: true,
          });
          const v = st?.value?.[0];
          if (
            v &&
            !v.err &&
            (v.confirmationStatus === "confirmed" ||
              v.confirmationStatus === "finalized")
          ) {
            return { signature: sig, amount: amountWhole };
          }
        } catch {
          /* */
        }
      }
      if (/insufficient|0x1|blockhash not found/i.test(lastErr.message)) {
        // hard fail
        break;
      }
      await sleep(500 * attempt);
    }
  }

  throw lastErr || new Error("Treasury send failed after retries");
}
