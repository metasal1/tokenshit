/**
 * Privy gas-sponsorship defense — Solana ATA rent-refund abuse.
 * https://docs.privy.io/wallets/gas-and-asset-management/gas/security#security-best-practices
 *
 * Jupiter (and others) often append Token CloseAccount so temporary ATAs refund
 * rent to the *user*. With app-pays gas, attackers open/close ATAs and pocket rent
 * while Privy pays create fees. Strip CloseAccount before sponsor:true.
 */

import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
  MessageV0,
} from "@solana/web3.js";

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

/** SPL Token / Token-2022 CloseAccount discriminator */
const CLOSE_ACCOUNT_IX = 9;

function isCloseAccountIx(programId: PublicKey, data: Uint8Array | Buffer): boolean {
  const pid = programId.toBase58();
  if (
    pid !== TOKEN_PROGRAM_ID.toBase58() &&
    pid !== TOKEN_2022_PROGRAM_ID.toBase58()
  ) {
    return false;
  }
  return data.length > 0 && data[0] === CLOSE_ACCOUNT_IX;
}

export type StripCloseResult = {
  bytes: Uint8Array;
  stripped: number;
  mode: "legacy" | "versioned" | "unchanged" | "failed";
};

/**
 * Remove Token/Token-2022 CloseAccount instructions from a serialized tx.
 * Prefer legacy Jupiter builds when sponsoring (simpler + fully stripable).
 */
export function stripCloseAccountFromTxBytes(txBytes: Uint8Array): StripCloseResult {
  // ── Legacy Transaction ──────────────────────────────────────────
  try {
    const tx = Transaction.from(Buffer.from(txBytes));
    const before = tx.instructions.length;
    const kept: TransactionInstruction[] = [];
    let stripped = 0;
    for (const ix of tx.instructions) {
      if (isCloseAccountIx(ix.programId, ix.data)) {
        stripped++;
        continue;
      }
      kept.push(ix);
    }
    if (stripped === 0) {
      return { bytes: txBytes, stripped: 0, mode: "unchanged" };
    }
    tx.instructions = kept;
    const out = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    return {
      bytes: new Uint8Array(out),
      stripped,
      mode: "legacy",
    };
  } catch {
    /* versioned path */
  }

  // ── Versioned / v0 ──────────────────────────────────────────────
  try {
    const vtx = VersionedTransaction.deserialize(txBytes);
    const msg = vtx.message;
    // Need resolved keys — without ALT lookups we only see static keys.
    // If looksups exist, we still filter static-program CloseAccount ixs.
    const accountKeys = msg.getAccountKeys();
    const compiled = msg.compiledInstructions;
    let stripped = 0;
    const kept = compiled.filter((ix) => {
      const prog = accountKeys.get(ix.programIdIndex);
      if (!prog) return true;
      const data = ix.data instanceof Uint8Array ? ix.data : new Uint8Array(ix.data);
      if (isCloseAccountIx(prog, data)) {
        stripped++;
        return false;
      }
      return true;
    });

    if (stripped === 0) {
      return { bytes: txBytes, stripped: 0, mode: "unchanged" };
    }

    if (msg.version === "legacy" || (msg as { version?: number }).version === undefined) {
      // legacy versioned wrapper — fall through rebuild via MessageV0 only for v0
    }

    // Rebuild v0 message keeping ALT lookups (CloseAccount is usually on static token program)
    const header = msg.header;
    const staticKeys = msg.staticAccountKeys;
    const lookups = msg.addressTableLookups || [];

    const newMsg = new MessageV0({
      header,
      staticAccountKeys: staticKeys,
      recentBlockhash: msg.recentBlockhash,
      compiledInstructions: kept.map((ix) => ({
        programIdIndex: ix.programIdIndex,
        accountKeyIndexes: [...ix.accountKeyIndexes],
        data: ix.data instanceof Uint8Array ? ix.data : new Uint8Array(ix.data),
      })),
      addressTableLookups: lookups,
    });

    const rebuilt = new VersionedTransaction(newMsg);
    // Preserve existing signatures slots (will re-sign)
    rebuilt.signatures = vtx.signatures.map((s) => new Uint8Array(s));
    return {
      bytes: rebuilt.serialize(),
      stripped,
      mode: "versioned",
    };
  } catch {
    return { bytes: txBytes, stripped: 0, mode: "failed" };
  }
}

/** Convenience: base64 in → cleaned bytes out */
export function stripCloseAccountFromBase64(b64: string): StripCloseResult {
  const clean = b64.replace(/\s/g, "");
  const bytes =
    typeof Buffer !== "undefined"
      ? new Uint8Array(Buffer.from(clean, "base64"))
      : Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
  return stripCloseAccountFromTxBytes(bytes);
}
