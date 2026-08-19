/**
 * One-time SOL gas drop so claimers can play without buying SOL.
 * 67 games × est. fee + buffer (see shit-token PLAY_GAS_*).
 */
import { tursoExecute } from "@/lib/turso";
import {
  PLAY_GAS_DROP_LAMPORTS,
  PLAY_GAS_DROP_SOL,
  PLAY_GAS_STARTER_GAMES,
} from "@/lib/shit-token";

let schemaReady = false;

export async function ensureGasDropSchema() {
  if (schemaReady) return;
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS sol_gas_drops (
      wallet TEXT PRIMARY KEY,
      twitter TEXT,
      lamports INTEGER NOT NULL,
      signature TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`
  );
  schemaReady = true;
}

export async function hasReceivedGasDrop(wallet: string): Promise<boolean> {
  await ensureGasDropSchema();
  const r = await tursoExecute(
    `SELECT wallet FROM sol_gas_drops WHERE lower(wallet) = lower(?) LIMIT 1`,
    [wallet]
  );
  return !!r.rows[0];
}

/**
 * Send starter SOL from claims treasury if wallet never received a drop
 * and current SOL is below a playable threshold.
 * Best-effort — never fails the parent claim.
 */
export async function maybeDropPlayGas(opts: {
  wallet: string;
  twitter?: string | null;
}): Promise<{
  dropped: boolean;
  signature?: string;
  lamports?: number;
  sol?: number;
  games?: number;
  reason?: string;
}> {
  const wallet = opts.wallet.trim();
  if (!wallet) return { dropped: false, reason: "no_wallet" };

  try {
    await ensureGasDropSchema();
    if (await hasReceivedGasDrop(wallet)) {
      return { dropped: false, reason: "already" };
    }

    const { Connection, PublicKey, SystemProgram, Transaction } =
      await import("@solana/web3.js");
    const { loadTreasuryKeypair } = await import("@/lib/treasury");
    const rpcUrl =
      process.env.SOLANA_RPC_URL ||
      process.env.HELIUS_RPC_URL ||
      "https://api.mainnet-beta.solana.com";

    const conn = new Connection(rpcUrl, "confirmed");
    const to = new PublicKey(wallet);
    const bal = await conn.getBalance(to);
    // Already has ≥ starter pack of gas — don't free-SOL farm
    if (bal >= PLAY_GAS_DROP_LAMPORTS) {
      return { dropped: false, reason: "already_funded", sol: bal / 1e9 };
    }

    const { isBlacklistedWallet, treasurySendsAllowed } = await import(
      "@/lib/security"
    );
    if (isBlacklistedWallet(wallet)) {
      return { dropped: false, reason: "blocked" };
    }
    const gate = treasurySendsAllowed();
    if (!gate.ok) {
      return { dropped: false, reason: gate.reason || "paused" };
    }

    let payer: import("@solana/web3.js").Keypair;
    try {
      payer = loadTreasuryKeypair();
    } catch (e) {
      return {
        dropped: false,
        reason: e instanceof Error ? e.message : "no_treasury_key",
      };
    }

    const payerBal = await conn.getBalance(payer.publicKey);
    // keep treasury with headroom
    if (payerBal < PLAY_GAS_DROP_LAMPORTS + 50_000_000) {
      return {
        dropped: false,
        reason: `treasury_low_sol:${(payerBal / 1e9).toFixed(4)}`,
      };
    }

    const { memoInstruction } = await import("@/lib/tx-memo");
    const { blockhash, lastValidBlockHeight } =
      await conn.getLatestBlockhash("confirmed");
    const tx = new Transaction({
      feePayer: payer.publicKey,
      blockhash,
      lastValidBlockHeight,
    }).add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: to,
        lamports: PLAY_GAS_DROP_LAMPORTS,
      }),
      memoInstruction("tokenshit.com/gas", [payer.publicKey])
    );
    tx.sign(payer);
    const signature = await conn.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    await conn.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    try {
      await tursoExecute(
        `INSERT INTO sol_gas_drops (wallet, twitter, lamports, signature)
         VALUES (?, ?, ?, ?)`,
        [
          wallet,
          opts.twitter || null,
          PLAY_GAS_DROP_LAMPORTS,
          signature,
        ]
      );
    } catch (e) {
      // unique race — ok
      const msg = e instanceof Error ? e.message : String(e);
      if (!/unique|UNIQUE/i.test(msg)) {
        console.error("sol_gas_drops insert", msg);
      }
    }

    return {
      dropped: true,
      signature,
      lamports: PLAY_GAS_DROP_LAMPORTS,
      sol: PLAY_GAS_DROP_SOL,
      games: PLAY_GAS_STARTER_GAMES,
    };
  } catch (e) {
    console.error("maybeDropPlayGas", e);
    return {
      dropped: false,
      reason: e instanceof Error ? e.message : String(e),
    };
  }
}
