/**
 * Sponsored Privy Solana sends with ATA CloseAccount stripped + rate gate.
 * @see https://docs.privy.io/wallets/gas-and-asset-management/gas/security
 */

import {
  b64ToBytes,
  encodeSigBs58,
  extractErrorMessage,
  friendlySolanaSendError,
  isPrepareFailure,
  sendRawBase64,
} from "@/lib/solana-send";
import { stripCloseAccountFromTxBytes } from "@/lib/strip-close-account";

function sigFromResult(result: unknown): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = result as any;
  if (!r) return null;
  if (typeof r === "string" && r.length > 40) return r;
  const sigBytes = r.signature;
  if (sigBytes instanceof Uint8Array) return encodeSigBs58(sigBytes);
  if (typeof r.signature === "string" && r.signature.length > 40) {
    return r.signature;
  }
  return null;
}

function extractSignedBytes(signed: unknown): Uint8Array | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = signed as any;
  if (!s) return null;
  if (s instanceof Uint8Array) return s;
  if (s.signedTransaction instanceof Uint8Array) return s.signedTransaction;
  if (s.transaction instanceof Uint8Array) return s.transaction;
  return null;
}

export type SponsorSendOpts = {
  /** base64 or raw bytes */
  transaction: string | Uint8Array;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: any;
  walletAddress: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signAndSendTransaction: (args: any) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTransaction?: (args: any) => Promise<any>;
  description?: string;
  kind?: string;
  /** User SOL balance — used for self-pay fallback */
  solBalance?: number | null;
  /** If sponsor gate denies or Privy sponsor fails, try user-pays when SOL ok */
  allowSelfPayFallback?: boolean;
};

/**
 * 1) Strip CloseAccount (rent-refund abuse)
 * 2) Server rate gate /api/sponsor/gate
 * 3) sponsor:true
 * 4) optional self-pay fallback
 */
export async function sendSponsoredSolanaTx(
  opts: SponsorSendOpts
): Promise<{ signature: string; sponsored: boolean; stripped: number }> {
  const {
    wallet,
    walletAddress,
    signAndSendTransaction,
    signTransaction,
    description,
    kind,
    solBalance,
    allowSelfPayFallback = true,
  } = opts;

  const rawBytes =
    typeof opts.transaction === "string"
      ? b64ToBytes(opts.transaction)
      : opts.transaction;

  const { bytes: safeBytes, stripped } = stripCloseAccountFromTxBytes(rawBytes);

  // Rate / abuse gate — consume one slot when we will attempt sponsor
  let allowSponsor = true;
  try {
    const gate = await fetch("/api/sponsor/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: walletAddress,
        kind: kind || "client_tx",
      }),
    });
    const g = await gate.json().catch(() => ({}));
    if (g.allow === false) {
      allowSponsor = false;
    }
  } catch {
    // fail closed on sponsor if gate unreachable
    allowSponsor = false;
  }

  const sol =
    solBalance == null || !Number.isFinite(solBalance) ? null : solBalance;

  if (allowSponsor) {
    try {
      const result = await signAndSendTransaction({
        transaction: safeBytes,
        wallet,
        chain: "solana:mainnet",
        options: {
          sponsor: true,
          uiOptions: {
            showWalletUIs: true,
            description:
              description ||
              "Network fees sponsored by TOKEN$HIT (CloseAccount stripped)",
          },
        },
      });
      const signature = sigFromResult(result);
      if (signature) {
        return { signature, sponsored: true, stripped };
      }
    } catch (e) {
      if (/user rejected|denied|cancel/i.test(extractErrorMessage(e))) {
        throw e;
      }
      // fall through to self-pay
      if (!allowSelfPayFallback) {
        throw new Error(
          friendlySolanaSendError(e) ||
            "Sponsorship failed. Add a little SOL and retry."
        );
      }
    }
  }

  if (!allowSelfPayFallback) {
    throw new Error(
      allowSponsor
        ? "Sponsorship failed."
        : "Sponsorship limit reached for today. Add ~0.01 SOL and retry, or try again tomorrow."
    );
  }

  if (sol != null && sol < 0.003) {
    throw new Error(
      allowSponsor
        ? "Could not sponsor this tx and wallet has almost no SOL. Add ~0.01 SOL, then retry."
        : "Daily sponsorship limit reached and wallet has almost no SOL. Add ~0.01 SOL or try tomorrow."
    );
  }

  // Self-pay — still use stripped tx (safer; no unexpected closes)
  try {
    const result = await signAndSendTransaction({
      transaction: safeBytes,
      wallet,
      chain: "solana:mainnet",
      options: {
        sponsor: false,
        uiOptions: {
          showWalletUIs: true,
          description: description || "You pay network fee",
        },
      },
    });
    const signature = sigFromResult(result);
    if (signature) return { signature, sponsored: false, stripped };
  } catch (e) {
    if (!signTransaction || !isPrepareFailure(e)) {
      throw new Error(friendlySolanaSendError(e));
    }
    const signed = await signTransaction({
      transaction: safeBytes,
      wallet,
      chain: "solana:mainnet",
      options: { uiOptions: { showWalletUIs: true } },
    });
    const signedBytes = extractSignedBytes(signed);
    if (!signedBytes) throw e;
    const signature = await sendRawBase64(signedBytes, { skipPreflight: true });
    return { signature, sponsored: false, stripped };
  }

  throw new Error("Send failed — no signature");
}
