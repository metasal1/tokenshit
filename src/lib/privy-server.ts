import { importSPKI, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

/**
 * Edge-safe Privy auth for Cloudflare Workers.
 * Official verify uses ES256 SPKI verification key (NOT JWKS).
 * @see PrivyClient.verifyAuthToken in @privy-io/server-auth
 */

const PRIVY_APP_ID =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || "";
/** PEM public key from Privy app settings (optional cache) */
const PRIVY_VERIFICATION_KEY = (process.env.PRIVY_VERIFICATION_KEY || "").trim();

export type PrivyIdentity = {
  privyId: string;
  twitter: string | null;
  github: string | null;
  wallets: string[];
};

let cachedSpki: CryptoKey | null = null;
let cachedPem: string | null = null;

function basicAuthHeader(): string {
  // btoa works on Workers; Node Buffer fallback
  const raw = `${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`;
  try {
    return `Basic ${btoa(raw)}`;
  } catch {
    return `Basic ${Buffer.from(raw, "utf8").toString("base64")}`;
  }
}

async function fetchVerificationPem(): Promise<string> {
  if (PRIVY_VERIFICATION_KEY.includes("BEGIN PUBLIC KEY")) {
    return PRIVY_VERIFICATION_KEY.replace(/\\n/g, "\n");
  }
  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    throw new Error("PRIVY_APP_ID / PRIVY_APP_SECRET missing");
  }
  const res = await fetch(`https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}`, {
    headers: {
      Authorization: basicAuthHeader(),
      "privy-app-id": PRIVY_APP_ID,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Privy app settings ${res.status}: ${t.slice(0, 120)}`);
  }
  const data = (await res.json()) as { verification_key?: string };
  const pem = (data.verification_key || "").trim();
  if (!pem) throw new Error("No verification_key in Privy app settings");
  return pem;
}

async function getVerifyKey(): Promise<CryptoKey> {
  const pem = await fetchVerificationPem();
  if (cachedSpki && cachedPem === pem) return cachedSpki;
  const key = await importSPKI(pem, "ES256");
  cachedSpki = key;
  cachedPem = pem;
  return key;
}

export function bearerFrom(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  const cookie =
    req.cookies.get("privy-token")?.value ||
    req.cookies.get("privy-id-token")?.value;
  return cookie || null;
}

export async function verifyPrivyAccessToken(
  token: string
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  if (!PRIVY_APP_ID) return { ok: false, error: "PRIVY_APP_ID missing" };
  const cleaned = token.replace(/^Bearer\s+/i, "").trim();
  if (!cleaned || cleaned.split(".").length < 3) {
    return { ok: false, error: "Token is not a JWT" };
  }
  try {
    const key = await getVerifyKey();
    const { payload } = await jwtVerify(cleaned, key, {
      issuer: "privy.io",
      audience: PRIVY_APP_ID,
      algorithms: ["ES256"],
    });
    const userId = typeof payload.sub === "string" ? payload.sub : "";
    if (!userId) return { ok: false, error: "JWT missing sub" };
    return { ok: true, userId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
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
    const res = await fetch(
      `https://auth.privy.io/api/v1/users/${encodeURIComponent(privyId)}`,
      {
        headers: {
          Authorization: basicAuthHeader(),
          "privy-app-id": PRIVY_APP_ID,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.error("privy getUser", res.status, await res.text());
      return empty;
    }
    const u = (await res.json()) as {
      linked_accounts?: Array<{
        type?: string;
        username?: string;
        address?: string;
        chain_type?: string;
      }>;
    };
    let twitter: string | null = null;
    let github: string | null = null;
    const wallets: string[] = [];
    for (const a of u.linked_accounts || []) {
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
          a.chain_type === "solana" ||
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
  if (!PRIVY_APP_SECRET && !PRIVY_VERIFICATION_KEY) {
    return {
      ok: false,
      res: Response.json(
        {
          error:
            "Server missing PRIVY_APP_SECRET / PRIVY_VERIFICATION_KEY — cannot verify session",
        },
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

  const verified = await verifyPrivyAccessToken(token);
  if (!verified.ok) {
    console.error("privy jwt verify failed", verified.error);
    return {
      ok: false,
      res: Response.json(
        {
          error: "Invalid or expired session — log out and log back in",
          detail: verified.error,
        },
        { status: 401 }
      ),
    };
  }

  const id = await fetchPrivyUser(verified.userId);

  if (opts?.requireTwitter) {
    if (!id.twitter) {
      // allow body twitter only if we couldn't load user profile
      if (opts.twitter) {
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
