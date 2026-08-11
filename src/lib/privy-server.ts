import { createRemoteJWKSet, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || "";

export type PrivyIdentity = {
  privyId: string;
  twitter: string | null;
  github: string | null;
  wallets: string[];
};

async function verifyPrivyJwt(token: string): Promise<string | null> {
  if (!PRIVY_APP_ID || !token) return null;
  try {
    const JWKS = createRemoteJWKSet(
      new URL(`https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json`)
    );
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: "privy.io",
      audience: PRIVY_APP_ID,
    });
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}

async function fetchPrivyUser(privyId: string): Promise<PrivyIdentity> {
  const empty: PrivyIdentity = {
    privyId,
    twitter: null,
    github: null,
    wallets: [],
  };
  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) return empty;
  try {
    const basic = Buffer.from(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`).toString(
      "base64"
    );
    const res = await fetch(
      `https://auth.privy.io/api/v1/users/${encodeURIComponent(privyId)}`,
      {
        headers: {
          Authorization: `Basic ${basic}`,
          "privy-app-id": PRIVY_APP_ID,
        },
      }
    );
    if (!res.ok) return empty;
    const u = await res.json();
    let twitter: string | null = null;
    let github: string | null = null;
    const wallets: string[] = [];
    const accounts = (u.linked_accounts || u.linkedAccounts || []) as Array<{
      type?: string;
      username?: string;
      address?: string;
    }>;
    for (const a of accounts) {
      const t = (a.type || "").toLowerCase();
      if (t === "twitter_oauth" || t === "twitter") {
        twitter = (a.username || "").toLowerCase().replace(/^@/, "") || null;
      }
      if (t === "github_oauth" || t === "github") {
        github = (a.username || "").toLowerCase().replace(/^@/, "") || null;
      }
      if (a.address && (t.includes("wallet") || t === "solana")) {
        wallets.push(a.address);
      }
    }
    return { privyId, twitter, github, wallets };
  } catch {
    return empty;
  }
}

export function bearerFrom(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

export async function requirePrivy(
  req: NextRequest,
  opts?: {
    twitter?: string | null;
    github?: string | null;
    wallet?: string | null;
    requireTwitter?: boolean;
  }
): Promise<{ ok: true; id: PrivyIdentity } | { ok: false; res: Response }> {
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
  const privyId = await verifyPrivyJwt(token);
  if (!privyId) {
    return {
      ok: false,
      res: Response.json({ error: "Invalid or expired session" }, { status: 401 }),
    };
  }

  const id = await fetchPrivyUser(privyId);

  // Without app secret, accept JWT + require client-provided twitter when needed
  if (opts?.requireTwitter) {
    if (id.twitter) {
      // ok
    } else if (opts.twitter && !PRIVY_APP_SECRET) {
      id.twitter = opts.twitter.toLowerCase().replace(/^@/, "");
    } else {
      return {
        ok: false,
        res: Response.json(
          {
            error: PRIVY_APP_SECRET
              ? "Link X to your account"
              : "Server missing PRIVY_APP_SECRET — cannot verify X link",
          },
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

  return { ok: true, id };
}
