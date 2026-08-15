import {
  SHIT_MINT,
  TREASURY_ADDRESS,
  PLAY_POT_ADDRESS,
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
  const bal = await getWalletTokenBalances(TREASURY_ADDRESS);
  return {
    address: TREASURY_ADDRESS,
    mint: SHIT_MINT,
    ...bal,
  };
}

export async function getPlayPotBalances(): Promise<{
  address: string;
  mint: string;
  shit: number;
  shitRaw: string;
  sol: number;
  solLamports: number;
  ata?: string;
}> {
  const bal = await getWalletTokenBalances(PLAY_POT_ADDRESS);
  return {
    address: PLAY_POT_ADDRESS,
    mint: SHIT_MINT,
    ...bal,
  };
}

async function getWalletTokenBalances(owner: string): Promise<{
  shit: number;
  shitRaw: string;
  sol: number;
  solLamports: number;
  ata?: string;
}> {
  const [solBal, tokenAccs] = await Promise.all([
    rpc<{ value: number }>("getBalance", [owner]),
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
      owner,
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
    shit: shitUi || rawToShit(shitRaw),
    shitRaw: shitRaw.toString(),
    sol: lamports / 1e9,
    solLamports: lamports,
    ata,
  };
}

/** Load treasury keypair from TREASURY_SECRET_JSON env (JSON byte array) */
export function loadTreasuryKeypair(): import("@solana/web3.js").Keypair {
  return loadKeypairFromEnv("TREASURY_SECRET_JSON");
}

/** Play pot escrow keypair — PLAY_POT_SECRET_JSON */
export function loadPlayPotKeypair(): import("@solana/web3.js").Keypair {
  return loadKeypairFromEnv("PLAY_POT_SECRET_JSON");
}

function loadKeypairFromEnv(
  envName: string
): import("@solana/web3.js").Keypair {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Keypair } = require("@solana/web3.js") as typeof import("@solana/web3.js");
  const raw = process.env[envName];
  if (!raw) throw new Error(`${envName} not configured`);
  const arr = JSON.parse(raw) as number[];
  if (!Array.isArray(arr) || arr.length !== 64) {
    throw new Error(`${envName} must be 64-byte JSON array`);
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
  return sendShitFromPayer({
    label: "Treasury",
    loadPayer: loadTreasuryKeypair,
    recipient,
    amountWhole,
    applyTreasuryGates: true,
  });
}

/** Play pot → winner (or house fee → SHTy). Fee payer may be treasury if pot SOL thin. */
export async function sendShitFromPlayPot(
  recipient: string,
  amountWhole: number
): Promise<{ signature: string; amount: number }> {
  return sendShitFromPayer({
    label: "Play pot",
    loadPayer: loadPlayPotKeypair,
    recipient,
    amountWhole,
    applyTreasuryGates: false,
    // pot often has tokens but 0 SOL — SHTy pays gas when needed
    allowTreasuryFeePayer: true,
    maxConfirmMs: 14_000,
    maxAttempts: 2,
  });
}

async function sendShitFromPayer(opts: {
  label: string;
  loadPayer: () => import("@solana/web3.js").Keypair;
  recipient: string;
  amountWhole: number;
  applyTreasuryGates: boolean;
  allowTreasuryFeePayer?: boolean;
  maxConfirmMs?: number;
  maxAttempts?: number;
}): Promise<{ signature: string; amount: number }> {
  const { isBlacklistedWallet, treasurySendsAllowed, maxSinglePayoutWhole } =
    await import("@/lib/security");

  if (opts.applyTreasuryGates) {
    const gate = treasurySendsAllowed();
    if (!gate.ok) {
      throw new Error(`Treasury sends paused (${gate.reason})`);
    }
  }
  if (isBlacklistedWallet(opts.recipient)) {
    throw new Error("Recipient wallet blocked");
  }
  const amountWhole = opts.amountWhole;
  if (!Number.isFinite(amountWhole) || amountWhole <= 0) {
    throw new Error("Invalid amount");
  }
  if (opts.applyTreasuryGates) {
    const cap = maxSinglePayoutWhole();
    if (amountWhole > cap) {
      throw new Error(
        `Amount ${amountWhole} exceeds max single payout ${cap} (set TREASURY_MAX_SINGLE to raise)`
      );
    }
  }

  const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } =
    await import("@solana/web3.js");
  const {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountIdempotentInstruction,
    createTransferCheckedInstruction,
    getAccount,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } = await import("@solana/spl-token");

  const TOKEN_2022_PROGRAM_ID = new PublicKey(TOKEN_2022_PROGRAM_ID_STR);
  const tokenAuthority = opts.loadPayer();
  const conn = new Connection(RPC, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 20_000,
    disableRetryOnRateLimit: false,
  });
  const mint = new PublicKey(SHIT_MINT);
  const toOwner = new PublicKey(opts.recipient);
  const raw = shitToRaw(amountWhole);
  const decimals = 6;

  let feePayer = tokenAuthority;
  if (opts.allowTreasuryFeePayer) {
    const potLamports = await conn.getBalance(tokenAuthority.publicKey);
    if (potLamports < 5_000_000) {
      // < 0.005 SOL — use claims treasury for gas (must still hold some SOL)
      try {
        const treasuryKp = loadTreasuryKeypair();
        const tLamports = await conn.getBalance(treasuryKp.publicKey);
        if (tLamports >= 3_000_000) {
          feePayer = treasuryKp;
        } else {
          throw new Error(
            `Play pot needs SOL for fees (pot=${(potLamports / 1e9).toFixed(4)} treasury=${(tLamports / 1e9).toFixed(4)}). Top up potRvs… with ~0.2 SOL`
          );
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes("top up")) throw e;
        throw new Error(
          `Play pot has no SOL for fees (${(potLamports / 1e9).toFixed(4)} SOL). Send ~0.2 SOL to pot wallet.`
        );
      }
    }
  }

  const fromAta = await getAssociatedTokenAddress(
    mint,
    tokenAuthority.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const toAta = await getAssociatedTokenAddress(
    mint,
    toOwner,
    true,
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
    throw new Error(
      `${opts.label} insufficient $TOKENSHIT (need ${amountWhole}, have ${
        fromAcc ? rawToShit(fromAcc.amount) : 0
      }; ata=${fromAta.toBase58()})`
    );
  }

  const ix = [
    createAssociatedTokenAccountIdempotentInstruction(
      feePayer.publicKey,
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
      tokenAuthority.publicKey,
      raw,
      decimals,
      [],
      TOKEN_2022_PROGRAM_ID
    ),
  ];

  const MAX_ATTEMPTS = opts.maxAttempts ?? 4;
  const confirmMs = opts.maxConfirmMs ?? 45_000;
  let lastErr: Error | null = null;
  const triedSigs: string[] = [];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const latest = await conn.getLatestBlockhash("confirmed");
      const tx = new Transaction().add(...ix);
      tx.feePayer = feePayer.publicKey;
      tx.recentBlockhash = latest.blockhash;
      // token authority always signs; fee payer signs if different
      if (feePayer.publicKey.equals(tokenAuthority.publicKey)) {
        tx.sign(tokenAuthority);
      } else {
        tx.sign(feePayer, tokenAuthority);
      }

      const rawTx = tx.serialize();
      const signature = await conn.sendRawTransaction(rawTx, {
        skipPreflight: true,
        maxRetries: 2,
        preflightCommitment: "confirmed",
      });
      triedSigs.push(signature);

      const status = await waitForSig(
        conn,
        signature,
        latest.lastValidBlockHeight,
        confirmMs
      );

      if (status === "confirmed") {
        return { signature, amount: amountWhole };
      }

      if (status === "failed") {
        throw new Error(`${opts.label} send failed on-chain (${signature})`);
      }

      // timeout/expired — if sig eventually lands, return it; else retry or accept unconfirmed
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
              v.confirmationStatus === "finalized" ||
              v.confirmationStatus === "processed")
          ) {
            return { signature: sig, amount: amountWhole };
          }
        } catch {
          /* */
        }
      }

      // On last attempt, return signature anyway if broadcast (worker time budget)
      if (attempt === MAX_ATTEMPTS && triedSigs.length) {
        return { signature: triedSigs[triedSigs.length - 1]!, amount: amountWhole };
      }

      lastErr = new Error(
        `Signature ${signature} ${status === "expired" ? "expired" : "confirm timeout"} (attempt ${attempt}/${MAX_ATTEMPTS})`
      );
      await sleep(300 * attempt);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      for (const sig of triedSigs) {
        try {
          const st = await conn.getSignatureStatuses([sig], {
            searchTransactionHistory: true,
          });
          const v = st?.value?.[0];
          if (v && !v.err && v.confirmationStatus) {
            return { signature: sig, amount: amountWhole };
          }
        } catch {
          /* */
        }
      }
      if (/insufficient|0x1|no SOL|top up/i.test(lastErr.message)) {
        break;
      }
      await sleep(400 * attempt);
    }
  }

  throw lastErr || new Error(`${opts.label} send failed after retries`);
}
