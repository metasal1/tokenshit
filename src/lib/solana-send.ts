/** Client Solana send helpers — Jupiter base64 txs + Privy sign. */

/** Same-origin RPC proxy (never dedicated Helius in the browser bundle). */
export function getSolanaSendRpc(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/rpc`;
  }
  return "https://tokenshit.com/api/rpc";
}

/** @deprecated use getSolanaSendRpc() — kept for import compat */
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
    return "Wallet send failed. Pay gas with your own SOL (~0.01) — sponsorship is off. Retry Play.";
  }
  if (/insufficient|0x1|lamport|insufficientfundsforrent|0x0/i.test(low)) {
    return "Not enough SOL for fees (keep ~0.01 SOL) or not enough $TOKENSHIT for this play.";
  }
  if (/blockhash|expired|block height/i.test(low)) {
    return "Tx expired — tap Play again.";
  }
  if (
    /-32602|invalid (method )?param|failed to prepare|preparing your transaction/i.test(
      low
    )
  ) {
    return "Wallet prepare failed (Token-2022). Retry — we sign + broadcast ourselves.";
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
  if (m.length > 220) return `${m.slice(0, 200)}…`;
  return m || "Something went wrong — retry.";
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

function sigFromResult(result: unknown): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = result as any;
  const sigBytes = r?.signature;
  if (sigBytes instanceof Uint8Array) return encodeSigBs58(sigBytes);
  if (typeof r?.signature === "string" && r.signature.length > 40) {
    return r.signature;
  }
  if (typeof r === "string" && r.length > 40) return r;
  return null;
}

/**
 * Send a prebuilt tx via Privy.
 *
 * Gas sponsorship is OFF in production — prefer user-paid fees
 * (sponsor:false) + signTransaction → raw broadcast fallback.
 * Only attempt sponsor when the wallet has almost no SOL.
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

  const sol = solBalance == null || !Number.isFinite(solBalance) ? null : solBalance;
  // Play Token-2022 transfer is cheap; 0.002 SOL is enough headroom
  const canSelfPay = sol == null || sol >= 0.002;

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
  let lastErr: unknown;

  const attempts: Array<() => Promise<unknown>> = [];

  if (canSelfPay) {
    // 1) User pays gas — no sponsor (primary path)
    attempts.push(() => trySend(false, true));
    // 2) Sign only + our RPC broadcast (bypasses broken Privy prepare/sponsor UI)
    if (signTransaction) {
      attempts.push(async () => {
        const signed = await signTransaction({
          transaction: txBytes,
          wallet,
          chain: "solana:mainnet",
          options: {
            uiOptions: {
              showWalletUIs: true,
              description: description || undefined,
            },
          },
        });
        const signedBytes =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (signed as any)?.signedTransaction ??
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (signed as any)?.transaction ??
          signed;
        if (!(signedBytes instanceof Uint8Array)) {
          throw new Error("Wallet returned no signed transaction bytes");
        }
        return { signature: await sendRawBase64(signedBytes, { skipPreflight: true }) };
      });
    }
    // 3) Last resort: sponsor (may still be configured for some users)
    attempts.push(() => trySend(true, false));
    attempts.push(() => trySend(true, true));
  } else {
    // Almost no SOL — try sponsor first, then clear error
    attempts.push(() => trySend(true, false));
    attempts.push(() => trySend(true, true));
    attempts.push(() => trySend(false, true));
  }

  for (const run of attempts) {
    try {
      const result = await run();
      const sig = sigFromResult(result);
      if (sig) return sig;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nested = sigFromResult((result as any)?.data ?? (result as any)?.result);
      if (nested) return nested;
    } catch (e) {
      lastErr = e;
      // user cancel — stop
      if (/user rejected|denied|cancel/i.test(extractErrorMessage(e))) {
        throw e instanceof Error ? e : new Error(extractErrorMessage(e));
      }
    }
  }

  if ((sol ?? 0) < 0.002 && isPrepareFailure(lastErr)) {
    throw new Error(
      "Not enough SOL for fees and sponsorship is off. Add ~0.01 SOL on Buy, then retry."
    );
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error(extractErrorMessage(lastErr) || "Send failed");
}
