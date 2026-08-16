/**
 * Client Solana send helpers — Jupiter base64 txs + Privy sign.
 * Prefer signTransaction + our RPC send when Privy "prepare" fails (-32602).
 */

export const SOLANA_SEND_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://viviyan-bkj12u-fast-mainnet.helius-rpc.com";

/** Reliable base64 → bytes (atob can mangle large txs in some browsers). */
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

export function friendlySolanaSendError(e: unknown): string {
  const m = extractErrorMessage(e);
  const low = m.toLowerCase();
  if (/user rejected|denied|cancel/i.test(m)) return "Cancelled.";
  if (/something went wrong|please try again/i.test(low) && m.length < 80) {
    return "Wallet could not send this tx. Need ≥1,000 $TOKENSHIT + a little SOL (or fee sponsor). Retry, or Claim/Buy first.";
  }
  if (/insufficient|0x1|lamport|insufficientfundsforrent|0x0/i.test(low)) {
    return "Not enough SOL for fees (keep ~0.01 SOL) or not enough $TOKENSHIT for this play.";
  }
  if (/blockhash|expired|block height/i.test(low)) {
    return "Tx expired — tap Play again.";
  }
  if (/-32602|invalid (method )?param|failed to prepare|preparing your transaction/i.test(low)) {
    return "Wallet prepare failed (common with Token-2022). Retry — we fall back to sign + broadcast.";
  }
  if (/5663005|lookup table|address lookup/i.test(low)) {
    return "Wallet couldn’t load the route — refresh and try again.";
  }
  if (/slippage|0x1771|custom program error: 6001/i.test(low)) {
    return "Price moved — bump slippage or retry.";
  }
  if (/need .*tokenshit|insufficient_shit/i.test(low)) {
    return m;
  }
  // trim huge Privy dumps
  if (m.length > 220) return `${m.slice(0, 200)}…`;
  return m || "Something went wrong — retry.";
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

export function isPrepareFailure(e: unknown): boolean {
  const m = extractErrorMessage(e);
  return /failed to prepare|-32602|invalid (method )?param|preparing your transaction|simulate|something went wrong/i.test(
    m
  );
}

/** Send already-signed tx bytes via JSON-RPC. */
export async function sendRawBase64(
  signedTx: Uint8Array,
  opts?: { skipPreflight?: boolean }
): Promise<string> {
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(signedTx).toString("base64")
      : btoa(String.fromCharCode(...Array.from(signedTx)));
  const res = await fetch(SOLANA_SEND_RPC, {
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
          maxRetries: 3,
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

/**
 * Sign+send with Privy: sponsor first → UI → unsponsored → sign+raw RPC.
 * Returns base58 signature.
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
  /** user SOL balance for fee fallbacks */
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

  const trySend = (sponsor: boolean, showUi: boolean) =>
    signAndSendTransaction({
      transaction: txBytes,
      wallet,
      chain: "solana:mainnet",
      options: {
        sponsor,
        uiOptions: {
          showWalletUIs: showUi,
          description: description || undefined,
        },
      },
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  let lastErr: unknown;

  try {
    result = await trySend(true, false);
  } catch (e1) {
    lastErr = e1;
    try {
      result = await trySend(true, true);
    } catch (e2) {
      lastErr = e2;
      // unsponsored if user has SOL
      if ((solBalance ?? 0) >= 0.003) {
        try {
          result = await trySend(false, true);
        } catch (e3) {
          lastErr = e3;
          result = null;
        }
      } else {
        result = null;
      }
    }
  }

  if (result) {
    const sigBytes = result?.signature;
    if (sigBytes instanceof Uint8Array) return encodeSigBs58(sigBytes);
    if (typeof result?.signature === "string") return result.signature;
  }

  // sign + our RPC broadcast (bypasses Privy prepare on Token-2022)
  if (signTransaction && (solBalance ?? 0) >= 0.003) {
    try {
      const signed = await signTransaction({
        transaction: txBytes,
        wallet,
        chain: "solana:mainnet",
        options: { uiOptions: { showWalletUIs: true } },
      });
      const signedBytes = signed?.signedTransaction;
      if (signedBytes instanceof Uint8Array) {
        return await sendRawBase64(signedBytes, { skipPreflight: true });
      }
    } catch (e4) {
      lastErr = e4;
    }
  }

  if ((solBalance ?? 0) < 0.003 && isPrepareFailure(lastErr)) {
    throw new Error(
      "Fee sponsorship failed and this wallet has almost no SOL. Add ~0.01 SOL (Add SOL on Swap), then retry."
    );
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(extractErrorMessage(lastErr) || "Send failed");
}
