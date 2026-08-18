/**
 * Jupiter VRFD / Express Verification helpers.
 * Docs: https://dev.jup.ag/docs/tokens/verification
 * Dashboard: https://verified.jup.ag/dashboard/<mint>
 *
 * SOT for TOKENSHIT catalog remains tokens.xyz — this is Jupiter badge only.
 */
import { SHIT_MINT, X_HANDLE, X_URL } from "@/lib/shit-token";

const JUP_API = "https://api.jup.ag";

export const JUP_VRFD_DASHBOARD = (mint: string = SHIT_MINT) =>
  `https://verified.jup.ag/dashboard/${mint}`;

export type JupEligibility = {
  tokenExists: boolean;
  isVerified: boolean;
  canVerify: boolean;
  canMetadata: boolean;
  verificationError?: string;
  metadataError?: string;
  existingMetadataId?: number;
};

function jupHeaders(): HeadersInit {
  const key =
    process.env.JUP_API_KEY ||
    process.env.JUPITER_API_KEY ||
    "";
  const h: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "TokenShit/1.0 (+https://tokenshit.com)",
  };
  if (key) h["x-api-key"] = key;
  return h;
}

export async function checkJupVrfdEligibility(
  tokenId: string = SHIT_MINT
): Promise<JupEligibility> {
  const url = `${JUP_API}/tokens/v2/verify/express/check-eligibility?tokenId=${encodeURIComponent(tokenId)}`;
  const res = await fetch(url, { headers: jupHeaders(), cache: "no-store" });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Jupiter eligibility ${res.status}: ${t.slice(0, 200)}`);
  }
  return (await res.json()) as JupEligibility;
}

/** Fast isVerified via tokens search (works on lite-api too). */
export async function isJupTokenVerified(
  tokenId: string = SHIT_MINT
): Promise<boolean> {
  try {
    const elig = await checkJupVrfdEligibility(tokenId);
    return Boolean(elig.isVerified);
  } catch {
    /* fall through to search */
  }
  try {
    const url = `https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(tokenId)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as Array<{ id?: string; isVerified?: boolean }>;
    const hit = (data || []).find(
      (t) => String(t.id || "").toLowerCase() === tokenId.toLowerCase()
    );
    return Boolean(hit?.isVerified);
  } catch {
    return false;
  }
}

export type CraftTxnResult = {
  transaction: string;
  requestId: string;
  amount?: string;
  quotedInputAmount?: string;
  expireAt?: string;
  gasless?: boolean;
  code?: number;
  [k: string]: unknown;
};

export async function craftJupVrfdTxn(opts: {
  senderAddress: string;
  paymentCurrency?: "JUP" | "SOL" | "USDC" | "JUPUSD";
}): Promise<CraftTxnResult> {
  const cur = opts.paymentCurrency || "SOL";
  const url = new URL(`${JUP_API}/tokens/v2/verify/express/craft-txn`);
  url.searchParams.set("senderAddress", opts.senderAddress);
  if (cur !== "JUP") url.searchParams.set("paymentCurrency", cur);
  const res = await fetch(url.toString(), {
    headers: jupHeaders(),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string; message?: string }).error ||
        (data as { message?: string }).message ||
        `craft-txn ${res.status}`
    );
  }
  if (!(data as CraftTxnResult).transaction || !(data as CraftTxnResult).requestId) {
    throw new Error("craft-txn missing transaction/requestId");
  }
  return data as CraftTxnResult;
}

export type ExecuteVrfdResult = {
  status: string;
  signature?: string;
  error?: string;
  verificationCreated?: boolean;
  metadataCreated?: boolean;
};

export async function executeJupVrfd(opts: {
  transaction: string;
  requestId: string;
  senderAddress: string;
  tokenId?: string;
  twitterHandle?: string;
  description?: string;
  senderTwitterHandle?: string | null;
  paymentCurrency?: "JUP" | "SOL" | "USDC" | "JUPUSD";
  paymentAmount?: string;
  jupOutputAmount?: string;
}): Promise<ExecuteVrfdResult> {
  const tokenId = opts.tokenId || SHIT_MINT;
  const body: Record<string, unknown> = {
    transaction: opts.transaction,
    requestId: opts.requestId,
    senderAddress: opts.senderAddress,
    tokenId,
    twitterHandle: opts.twitterHandle || X_URL || `https://x.com/${X_HANDLE}`,
    description:
      opts.description ||
      "TOKEN$HIT — every token is shit until proven otherwise. Community play + claims on Solana.",
    tokenMetadata: {
      tokenId,
      name: "TokenShit",
      symbol: "TOKENSHIT",
      website: "https://tokenshit.com",
      twitter: X_URL,
      tokenDescription:
        "Every token is shit until proven otherwise. Play HIT/SHIT hourly pots, claim rewards.",
    },
  };
  if (opts.senderTwitterHandle) {
    body.senderTwitterHandle = opts.senderTwitterHandle.startsWith("http")
      ? opts.senderTwitterHandle
      : `https://x.com/${opts.senderTwitterHandle.replace(/^@/, "")}`;
  }
  if (opts.paymentCurrency && opts.paymentCurrency !== "JUP") {
    body.paymentCurrency = opts.paymentCurrency;
    if (opts.paymentAmount) body.paymentAmount = opts.paymentAmount;
    if (opts.jupOutputAmount) body.jupOutputAmount = opts.jupOutputAmount;
  }

  const res = await fetch(`${JUP_API}/tokens/v2/verify/express/execute`, {
    method: "POST",
    headers: jupHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as ExecuteVrfdResult;
  if (!res.ok) {
    throw new Error(data.error || `execute ${res.status}`);
  }
  return data;
}
