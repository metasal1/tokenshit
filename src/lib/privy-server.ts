import { PrivyClient } from "@privy-io/server-auth";
import type { NextRequest } from "next/server";

const PRIVY_APP_ID =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || "";

export type PrivyIdentity = {
  privyId: string;
  twitter: string | null;
  github: string | null;
  wallets: string[];
};

let client: PrivyClient | null = null;

function getClient(): PrivyClient | null {
  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) return null;
  if (!client) {
    client = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);
  }
  return client;
}

export function bearerFrom(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  // Privy also drops cookies in some clients
  const cookie =
    req.cookies.get("privy-token")?.value ||
    req.cookies.get("privy-id-token")?.value;
  return cookie || null;
}

async function fetchPrivyUser(privyId: string): Promise<PrivyIdentity> {
  const empty: PrivyIdentity = {
    privyId,
    twitter: null,
    github: null,
    wallets: [],
  };
  const c = getClient();
  if (!c) return empty;
  try {
    const u = await c.getUser(privyId);
    let twitter: string | null = null;
    let github: string | null = null;
    const wallets: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accounts = ((u as any).linkedAccounts ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (u as any).linked_accounts ||
      []) as Array<{
      type?: string;
      username?: string;
      address?: string;
      chainType?: string;
    }>;
    for (const a of accounts) {
      const t = (a.type || "").toLowerCase();
      if (t === "twitter_oauth" || t === "twitter") {
        twitter = (a.username || "").toLowerCase().replace(/^@/, "") || null;
      }
      if (t === "github_oauth" || t === "github") {
        github = (a.username || "").toLowerCase().replace(/^@/, "") || null;
      }
      if (
        a.address &&
        (t.includes("wallet") ||
          t === "solana" ||
          a.chainType === "solana" ||
          t.includes("solana"))
      ) {
        wallets.push(a.address);
      }
    }
    return { privyId, twitter, github, wallets };
  } catch (e) {
    console.error("privy getUser failed", e);
    return empty;
  }
}

/**
 * Verify Privy access token from Authorization: Bearer <token>
 * Uses official @privy-io/server-auth (handles JWKS / ES256 correctly).
 */
export async function requirePrivy(
  req: NextRequest,
  opts?: {
    twitter?: string | null;
    github?: string | null;
    wallet?: string | null;
    requireTwitter?: boolean;
  }
): Promise<{ ok: true; id: PrivyIdentity } | { ok: false; res: Response }> {
  if (!PRIVY_APP_ID) {
    return {
      ok: false,
      res: Response.json(
        { error: "Server misconfigured (PRIVY app id missing)" },
        { status: 503 }
      ),
    };
  }

  const token = bearerFrom(req);
  if (!token) {
    return {
      ok: false,
      res: Response.json(
        { error: "Login required (missing Privy token)" },
        { status: 401 }
      ),
    };
  }

  const c = getClient();
  if (!c) {
    return {
      ok: false,
      res: Response.json(
        {
          error:
            "Server missing PRIVY_APP_SECRET — cannot verify session. Set wrangler secret.",
        },
        { status: 503 }
      ),
    };
  }

  let privyId: string;
  try {
    const claims = await c.verifyAuthToken(token);
    privyId = claims.userId;
    if (!privyId) throw new Error("no userId in token");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("privy verifyAuthToken failed", msg);
    return {
      ok: false,
      res: Response.json(
        {
          error: "Invalid or expired session — log out and log back in",
          detail: process.env.NODE_ENV === "development" ? msg : undefined,
        },
        { status: 401 }
      ),
    };
  }

  const id = await fetchPrivyUser(privyId);

  if (opts?.requireTwitter) {
    if (id.twitter) {
      // ok
    } else if (opts.twitter && !PRIVY_APP_SECRET) {
      id.twitter = opts.twitter.toLowerCase().replace(/^@/, "");
    } else {
      return {
        ok: false,
        res: Response.json(
          { error: "Link X to your account" },
          { status: 403 }
        ),
      };
    }
  }

  if (id.twitter && opts?.twitter) {
    const want = opts.twitter.toLowerCase().replace(/^@/, "");
    if (id.twitter !== want) {
      return {
        ok: false,
        res: Response.json(
          { error: "Twitter handle does not match logged-in X account" },
          { status: 403 }
        ),
      };
    }
  }

  if (id.github && opts?.github) {
    const want = opts.github.toLowerCase().replace(/^@/, "");
    if (id.github !== want) {
      return {
        ok: false,
        res: Response.json(
          { error: "GitHub does not match logged-in account" },
          { status: 403 }
        ),
      };
    }
  }

  // Prefer server-known wallets when client wallet empty
  if (opts?.wallet && id.wallets.length && !id.wallets.includes(opts.wallet)) {
    // don't hard fail — embedded wallet address can differ from linked external
  }

  return { ok: true, id };
}
