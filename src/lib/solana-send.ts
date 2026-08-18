/** Client Solana send helpers — sign + our RPC (no Privy sponsor UI). */

/** Same-origin RPC proxy (never dedicated Helius in the browser bundle). */
export function getSolanaSendRpc(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/rpc`;
  }
  return "https://tokenshit.com/api/rpc";
}

/** @deprecated use getSolanaSendRpc() */
export const SOLANA_SEND_RPC =
  typeof window !== "undefined"
    ? `${typeof location !== "undefined" ? location.origin : ""}/api/rpc`
    : "https://tokenshit.com/api/rpc";

export function b64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s/g, "");
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(clean, "base64"));
  }
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeSigBs58(sigBytes: Uint8Array): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bs58 = require("bs58");
    const enc = bs58.encode || bs58.default?.encode;
    if (typeof enc === "function") return enc(Buffer.from(sigBytes));
  } catch {
    /* fall through */
  }
  const ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let zeros = 0;
  while (zeros < sigBytes.length && sigBytes[zeros] === 0) zeros++;
  const size = ((((sigBytes.length - zeros) * 138) / 100) | 0) + 1;
  const b = new Uint8Array(size);
  let length = 0;
  for (let i = zeros; i < sigBytes.length; i++) {
    let carry = sigBytes[i]!;
    let j = 0;
    for (let k = size - 1; k >= 0; k--, j++) {
      if (carry === 0 && j >= length) break;
      carry += 256 * b[k]!;
      b[k] = carry % 58;
      carry = (carry / 58) | 0;
    }
    length = j;
  }
  let out = "1".repeat(zeros);
  for (let i = size - length; i < size; i++) out += ALPHABET[b[i]!]!;
  return out;
}

export function extractErrorMessage(e: unknown): string {
  if (e == null) return "";
  if (typeof e === "string") return e;
  if (e instanceof Error) {
    const any = e as Error & {
      cause?: unknown;
      error?: { message?: string };
      data?: { message?: string };
    };
    const nested =
      (any.error && any.error.message) ||
      (any.data && any.data.message) ||
      (any.cause instanceof Error ? any.cause.message : "") ||
      "";
    return [e.message, nested].filter(Boolean).join(" — ");
  }
  if (typeof e === "object") {
    const o = e as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    if (o.error && typeof o.error === "object") {
      const em = (o.error as { message?: string }).message;
      if (em) return em;
    }
    try {
      return JSON.stringify(e).slice(0, 240);
    } catch {
      return String(e);
    }
  }
  return String(e);
}

export function friendlySolanaSendError(e: unknown): string {
  const m = extractErrorMessage(e);
  const low = m.toLowerCase();
  if (/user rejected|denied|cancel/i.test(m)) return "Cancelled.";
  if (/something went wrong|please try again|retry transaction/i.test(low)) {
    return "Wallet could not send. We use your SOL for gas (sponsorship off). Retry Play — if it keeps failing, refresh.";
  }
  if (/insufficient|0x1|lamport|insufficientfundsforrent/i.test(low)) {
    return "Not enough SOL for fees (keep ~0.01 SOL) or not enough $TOKENSHIT.";
  }
  if (/blockhash|expired|block height/i.test(low)) {
    return "Tx expired — tap Play again.";
  }
  if (/-32602|invalid (method )?param|failed to prepare/i.test(low)) {
    return "Wallet prepare failed. Retry Play.";
  }
  if (/need .*tokenshit|insufficient_shit/i.test(low)) return m;
  if (m.length > 220) return `${m.slice(0, 200)}…`;
  return m || "Send failed — retry.";
}

export function isPrepareFailure(e: unknown): boolean {
  const m = extractErrorMessage(e);
  return /failed to prepare|-32602|invalid (method )?param|preparing your transaction|simulate|something went wrong|retry transaction/i.test(
    m
  );
}

export async function sendRawBase64(
  signedTx: Uint8Array,
  opts?: { skipPreflight?: boolean }
): Promise<string> {
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(signedTx).toString("base64")
      : btoa(String.fromCharCode(...Array.from(signedTx)));
  const rpc = getSolanaSendRpc();
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "sendTransaction",
      params: [
        b64,
        {
          encoding: "base64",
          skipPreflight: opts?.skipPreflight ?? true,
          preflightCommitment: "confirmed",
          maxRetries: 5,
        },
      ],
    }),
  });
  const json = await res.json();
  if (json.error) {
    throw new Error(
      json.error.message || JSON.stringify(json.error).slice(0, 200)
    );
  }
  return String(json.result);
}

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
  // some privy versions nest
  if (s.signedTransaction?.serialize) {
    try {
      return s.signedTransaction.serialize();
    } catch {
      /* */
    }
  }
  return null;
}

/**
 * Self-pay gas path for Play (sponsorship OFF).
 *
 * Never opens Privy signAndSend "Retry transaction" UI first —
 * that path dies when gas sponsorship is disabled.
 *
 * Order:
 * 1) signTransaction (no sponsor) → broadcast via /api/rpc
 * 2) signAndSend sponsor:false, showWalletUIs:false (silent)
 * 3) signAndSend sponsor:false with UI only if silent failed
 */
export async function sendWithPrivyFallback(opts: {
  txBytes: Uint8Array;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signAndSendTransaction: (args: any) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTransaction?: (args: any) => Promise<any>;
  description?: string;
  solBalance?: number | null;
}): Promise<string> {
  const {
    txBytes,
    wallet,
    signAndSendTransaction,
    signTransaction,
    description,
    solBalance,
  } = opts;

  const sol =
    solBalance == null || !Number.isFinite(solBalance) ? null : solBalance;
  if (sol != null && sol < 0.0015) {
    throw new Error(
      "Need ~0.01 SOL for network fees (sponsorship is off). Add SOL on Buy, then retry."
    );
  }

  let lastErr: unknown;

  // ── 1) Sign only + our RPC (preferred) ──────────────────────────
  if (signTransaction) {
    try {
      const signed = await signTransaction({
        transaction: txBytes,
        wallet,
        chain: "solana:mainnet",
        options: {
          uiOptions: {
            // false avoids the broken Privy "Retry transaction" sheet
            showWalletUIs: false,
            description: description || "Play ticket — you pay a tiny SOL fee",
          },
        },
      });
      const bytes = extractSignedBytes(signed);
      if (bytes) {
        return await sendRawBase64(bytes, { skipPreflight: true });
      }
      lastErr = new Error("Wallet returned no signed bytes");
    } catch (e) {
      lastErr = e;
      if (/user rejected|denied|cancel/i.test(extractErrorMessage(e))) throw e;
    }

    // retry sign with UI if silent sign unsupported
    try {
      const signed = await signTransaction({
        transaction: txBytes,
        wallet,
        chain: "solana:mainnet",
        options: {
          uiOptions: {
            showWalletUIs: true,
            description: description || "Play ticket — you pay a tiny SOL fee",
          },
        },
      });
      const bytes = extractSignedBytes(signed);
      if (bytes) {
        return await sendRawBase64(bytes, { skipPreflight: true });
      }
    } catch (e) {
      lastErr = e;
      if (/user rejected|denied|cancel/i.test(extractErrorMessage(e))) throw e;
    }
  }

  // ── 2) signAndSend self-pay, NO wallet UI (no error modal) ──────
  try {
    const result = await signAndSendTransaction({
      transaction: txBytes,
      wallet,
      chain: "solana:mainnet",
      options: {
        sponsor: false,
        uiOptions: {
          showWalletUIs: false,
          description: description || undefined,
        },
      },
    });
    const sig = sigFromResult(result);
    if (sig) return sig;
  } catch (e) {
    lastErr = e;
    if (/user rejected|denied|cancel/i.test(extractErrorMessage(e))) throw e;
  }

  // ── 3) Last: signAndSend with UI (may still show Privy sheet) ───
  try {
    const result = await signAndSendTransaction({
      transaction: txBytes,
      wallet,
      chain: "solana:mainnet",
      options: {
        sponsor: false,
        uiOptions: {
          showWalletUIs: true,
          description: description || "Play — network fee from your SOL",
        },
      },
    });
    const sig = sigFromResult(result);
    if (sig) return sig;
  } catch (e) {
    lastErr = e;
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error(extractErrorMessage(lastErr) || "Send failed");
}
