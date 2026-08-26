/**
 * Jupiter VRFD — likes + Express helpers.
 * Likes API (public): https://token-verify-api.jup.ag
 * Docs: https://dev.jup.ag/docs/tokens/verification
 *
 * Claim action: user likes TOKENSHIT on verified.jup.ag with same X → 5k SHIT.
 * Tokens.xyz remains catalog SOT.
 */
import { SHIT_MINT, X_HANDLE, X_URL } from "@/lib/shit-token";

const JUP_API = "https://api.jup.ag";
const VRFD_API = "https://token-verify-api.jup.ag";

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

export type JupLiker = {
  twitterId?: string;
  twitterUsername: string;
  profileImageUrl?: string;
};

type LikerIndex = {
  at: number;
  likes: number;
  byHandle: Map<string, JupLiker>;
  byId: Map<string, JupLiker>;
};

const LIKER_TTL_MS = 3 * 60 * 1000;
const likerCache = new Map<string, LikerIndex>();

function normHandle(raw: string | undefined | null): string {
  return String(raw || "")
    .replace(/^@/, "")
    .trim()
    .toLowerCase();
}

async function fetchLikerPage(
  mint: string,
  page: number,
  limit: number
): Promise<{
  rows: JupLiker[];
  total: number;
  totalPages: number;
  hasNext: boolean;
}> {
  const url = `${VRFD_API}/likes/list?mint=${encodeURIComponent(
    mint
  )}&page=${page}&limit=${limit}`;
  const res = await fetch(url, { headers: vrfdHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`VRFD likes/list ${res.status}`);
  const json = (await res.json()) as {
    success?: boolean;
    data?: JupLiker[];
    total?: number;
    pagination?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
      hasNext?: boolean;
    };
  };
  const rows = Array.isArray(json.data) ? json.data : [];
  const pg = json.pagination || {};
  const total = Number(pg.total ?? json.total ?? 0);
  const totalPages = Number(
    pg.totalPages || (total > 0 ? Math.ceil(total / limit) : 1)
  );
  const hasNext = pg.hasNext === true || page < totalPages;
  return { rows, total, totalPages, hasNext };
}

async function loadLikerIndex(mint: string): Promise<LikerIndex> {
  const hit = likerCache.get(mint);
  if (hit && Date.now() - hit.at < LIKER_TTL_MS) return hit;

  const limit = 50;
  const first = await fetchLikerPage(mint, 1, limit);
  const pages = Math.min(Math.max(first.totalPages || 1, 1), 20);
  const rest =
    pages > 1
      ? await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) =>
            fetchLikerPage(mint, i + 2, limit).catch(() => ({
              rows: [] as JupLiker[],
              total: first.total,
              totalPages: pages,
              hasNext: false,
            }))
          )
        )
      : [];

  const byHandle = new Map<string, JupLiker>();
  const byId = new Map<string, JupLiker>();
  for (const pack of [first, ...rest]) {
    for (const u of pack.rows) {
      const h = normHandle(u.twitterUsername);
      if (h) byHandle.set(h, u);
      const id = String(u.twitterId || "").trim();
      if (id) byId.set(id, u);
    }
  }
  const idx: LikerIndex = {
    at: Date.now(),
    likes: first.total || byHandle.size,
    byHandle,
    byId,
  };
  likerCache.set(mint, idx);
  return idx;
}

/**
 * Paginate VRFD likers until handle found or pages exhausted.
 * Public — no auth required.
 */
export async function userLikedTokenOnVrfd(opts: {
  twitter: string;
  twitterId?: string | null;
  mint?: string;
  maxPages?: number;
  pageSize?: number;
}): Promise<{
  liked: boolean;
  likes: number;
  matched?: JupLiker;
  pagesScanned: number;
  dashboard: string;
}> {
  const mint = opts.mint || SHIT_MINT;
  const handle = normHandle(opts.twitter);
  const twitterId = String(opts.twitterId || "").trim();
  const dashboard = JUP_VRFD_DASHBOARD(mint);
  if (!handle && !twitterId) {
    return { liked: false, likes: 0, pagesScanned: 0, dashboard };
  }

  // Fast path: top likers on summary
  try {
    const sum = await getTokenLikeSummary(mint);
    const top = sum.topLikers.find(
      (u) =>
        normHandle(u.twitterUsername) === handle ||
        (!!twitterId && String(u.twitterId || "") === twitterId)
    );
    if (top) {
      return {
        liked: true,
        likes: sum.likes,
        matched: top,
        pagesScanned: 0,
        dashboard,
      };
    }
  } catch {
    /* continue to full list */
  }

  try {
    const idx = await loadLikerIndex(mint);
    const matched =
      (handle && idx.byHandle.get(handle)) ||
      (twitterId && idx.byId.get(twitterId)) ||
      undefined;
    return {
      liked: !!matched,
      likes: idx.likes,
      matched,
      pagesScanned: 1,
      dashboard,
    };
  } catch {
    return { liked: false, likes: 0, pagesScanned: 0, dashboard };
  }
}

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

function vrfdHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "User-Agent": "TokenShit/1.0 (+https://tokenshit.com)",
  };
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

export async function isJupTokenVerified(
  tokenId: string = SHIT_MINT
): Promise<boolean> {
  try {
    const elig = await checkJupVrfdEligibility(tokenId);
    return Boolean(elig.isVerified);
  } catch {
    /* fall through */
  }
  try {
    const url = `https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(tokenId)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as Array<{
      id?: string;
      isVerified?: boolean;
    }>;
    const hit = (data || []).find(
      (t) => String(t.id || "").toLowerCase() === tokenId.toLowerCase()
    );
    return Boolean(hit?.isVerified);
  } catch {
    return false;
  }
}

/** Summary likes + top likers (includes smartLikes). */
export async function getTokenLikeSummary(
  mint: string = SHIT_MINT
): Promise<{
  likes: number;
  smartLikes: number;
  topLikers: JupLiker[];
}> {
  const url = `${VRFD_API}/likes?mint=${encodeURIComponent(mint)}`;
  const res = await fetch(url, { headers: vrfdHeaders(), cache: "no-store" });
  if (!res.ok) {
    throw new Error(`VRFD likes ${res.status}`);
  }
  const data = (await res.json()) as {
    likes?: number;
    smartLikes?: number;
    topLikers?: JupLiker[];
  };
  return {
    likes: Number(data.likes || 0),
    smartLikes: Number(data.smartLikes || 0),
    topLikers: Array.isArray(data.topLikers) ? data.topLikers : [],
  };
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
  if (
    !(data as CraftTxnResult).transaction ||
    !(data as CraftTxnResult).requestId
  ) {
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
