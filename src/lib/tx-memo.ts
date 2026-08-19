/**
 * SPL Memo — free branding on-chain ("tokenshit.com").
 * Program: MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
 */
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

/** Default site tag */
export const TX_MEMO_DEFAULT = "tokenshit.com";

export function memoInstruction(
  text: string = TX_MEMO_DEFAULT,
  /** Optional signer pubkeys (UTF-8 memo still works with none) */
  signers: PublicKey[] = []
): TransactionInstruction {
  const data = Buffer.from(text.slice(0, 566), "utf8");
  return new TransactionInstruction({
    keys: signers.map((pubkey) => ({
      pubkey,
      isSigner: true,
      isWritable: false,
    })),
    programId: MEMO_PROGRAM_ID,
    data,
  });
}

export function playMemo(side?: string, symbol?: string): string {
  const s = (side || "").toUpperCase();
  const sym = (symbol || "").replace(/[^\w.-]/g, "").slice(0, 12);
  if (s && sym) return `tokenshit.com/play ${s} ${sym}`;
  if (s) return `tokenshit.com/play ${s}`;
  return "tokenshit.com/play";
}

export function claimMemo(kind?: string): string {
  const k = (kind || "").replace(/[^\w.-]/g, "").slice(0, 24);
  return k ? `tokenshit.com/claim ${k}` : "tokenshit.com/claim";
}
