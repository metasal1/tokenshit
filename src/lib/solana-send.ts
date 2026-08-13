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
  const m = e instanceof Error ? e.message : String(e);
  const low = m.toLowerCase();
  if (/user rejected|denied|cancel/i.test(m)) return "Cancelled.";
  if (/insufficient|0x1|lamport|insufficientfundsforrent/i.test(low)) {
    return "Not enough SOL for fees (keep ~0.01 SOL) or not enough balance for this size.";
  }
  if (/blockhash|expired|block height/i.test(low)) {
    return "Quote expired — tap swap again for a fresh route.";
  }
  if (/-32602|invalid (method )?param|failed to prepare|preparing your transaction/i.test(low)) {
    return "Wallet could not prepare this route. Try a smaller size, more SOL for fees, or refresh.";
  }
  if (/5663005|lookup table|address lookup/i.test(low)) {
    return "Wallet couldn’t load the route — refresh and try again.";
  }
  if (/slippage|0x1771|custom program error: 6001/i.test(low)) {
    return "Price moved — bump slippage or retry.";
  }
  // trim huge Privy dumps
  if (m.length > 220) return `${m.slice(0, 200)}…`;
  return m;
}

export function isPrepareFailure(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e);
  return /failed to prepare|-32602|invalid (method )?param|preparing your transaction|simulate/i.test(
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
      : btoa(String.fromCharCode(...signedTx));
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
