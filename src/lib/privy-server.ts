import { importSPKI, jwtVerify, decodeJwt, decodeProtectedHeader, type KeyLike } from "jose";
import type { NextRequest } from "next/server";

/**
 * Edge-safe Privy auth for Cloudflare Workers.
 * Official path: ES256 SPKI verification_key from app settings (NOT JWKS).
 */

const PRIVY_APP_ID =
  (process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID || "").trim();
const PRIVY_APP_SECRET = (process.env.PRIVY_APP_SECRET || "").trim();
const PRIVY_VERIFICATION_KEY = (process.env.PRIVY_VERIFICATION_KEY || "").trim();
/** Optional second app id (migration / dual-app) */
const PRIVY_APP_ID_FALLBACK = (process.env.PRIVY_APP_ID_FALLBACK || "").trim();

export type PrivyIdentity = {
  privyId: string;
  twitter: string | null;
  github: string | null;
  wallets: string[];
};

const keyCache = new Map<string, KeyLike>();

function basicAuthHeader(appId: string, secret: string): string {
  const raw = `${appId}:${secret}`;
  try {
    return `Basic ${btoa(raw)}`;
  } catch {
    return `Basic ${Buffer.from(raw, "utf8").toString("base64")}`;
  }
}

/** Normalize PEM that may arrive single-line or with escaped newlines. */
export function normalizePem(input: string): string {
  let pem = input.trim();
  // wrangler / env sometimes store literal \n
  pem = pem.replace(/\\n/g, "\n").replace(/\r/g, "");
  if (!pem.includes("BEGIN PUBLIC KEY")) {
    // bare base64 body
    const body = pem.replace(/\s+/g, "");
    if (body.length > 40) {
      const lines = ["-----BEGIN PUBLIC KEY-----"];
      for (let i = 0; i < body.length; i += 64) lines.push(body.slice(i, i + 64));
      lines.push("-----END PUBLIC KEY-----");
      return lines.join("\n");
    }
    return pem;
  }
  if (!pem.includes("\n")) {
    const body = pem
      .replace(/-----BEGIN PUBLIC KEY-----/g, "")
      .replace(/-----END PUBLIC KEY-----/g, "")
      .replace(/\s+/g, "");
    const lines = ["-----BEGIN PUBLIC KEY-----"];
    for (let i = 0; i < body.length; i += 64) {
      lines.push(body.slice(i, i + 64));
    }
    lines.push("-----END PUBLIC KEY-----");
    pem = lines.join("\n");
  }
  return pem;
}

async function fetchVerificationPem(appId: string): Promise<string> {
  // Multi-app PEM map (JSON): { "appId": "-----BEGIN...\\n..." }
  const mapRaw = process.env.PRIVY_VERIFICATION_KEYS_JSON || "";
  if (mapRaw) {
    try {
      const map = JSON.parse(mapRaw) as Record<string, string>;
      if (map[appId]) return normalizePem(map[appId]);
    } catch {
      /* ignore */
    }
  }
  // Prefer env key when appId matches primary
  if (
    appId === PRIVY_APP_ID &&
    PRIVY_VERIFICATION_KEY &&
    (PRIVY_VERIFICATION_KEY.includes("BEGIN") ||
      PRIVY_VERIFICATION_KEY.length > 40)
  ) {
    return normalizePem(PRIVY_VERIFICATION_KEY);
  }
  if (!appId || !PRIVY_APP_SECRET) {
    throw new Error("PRIVY_APP_ID / PRIVY_APP_SECRET missing");
  }
  const res = await fetch(`https://auth.privy.io/api/v1/apps/${appId}`, {
    headers: {
      Authorization: basicAuthHeader(appId, PRIVY_APP_SECRET),
      "privy-app-id": appId,
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
  return normalizePem(pem);
}

async function getVerifyKey(appId: string): Promise<KeyLike> {
  const cacheKey = appId;
  if (keyCache.has(cacheKey)) return keyCache.get(cacheKey)!;
  const pem = await fetchVerificationPem(appId);
  const key = await importSPKI(pem, "ES256");
  keyCache.set(cacheKey, key);
  return key;
}

export function bearerFrom(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  // Some CF / browser paths drop Authorization — client may send x-privy-token
  const alt =
    req.headers.get("x-privy-token") ||
    req.headers.get("x-access-token") ||
    null;
  if (alt) return alt.trim();
  const cookie =
    req.cookies.get("privy-token")?.value ||
    req.cookies.get("privy-id-token")?.value;
  return cookie || null;
}

/** Also allow body.accessToken / body.privyToken */
export function tokenFromRequest(
  req: NextRequest,
  body?: Record<string, unknown> | null
): string | null {
  const header = bearerFrom(req);
  if (header) return header;
  if (body) {
    const t =
      body.accessToken ||
      body.privyToken ||
      body.token ||
      body.idToken;
    if (typeof t === "string" && t.trim()) return t.trim();
  }
  return null;
}

function candidateAppIds(tokenAud?: string | string[]): string[] {
  const ids: string[] = [];
  const push = (x?: string) => {
    if (x && !ids.includes(x)) ids.push(x);
  };
  if (Array.isArray(tokenAud)) tokenAud.forEach((a) => push(String(a)));
  else if (tokenAud) push(String(tokenAud));
  push(PRIVY_APP_ID);
  push(PRIVY_APP_ID_FALLBACK);
  // historical TOKENSHIT app
  push("cmn9qofoh00z50cjuijtbyf10");
  push("cmdz9woca0012ky0bgpyfqept");
  return ids.filter(Boolean);
}

export async function verifyPrivyAccessToken(
  token: string
): Promise<
  | { ok: true; userId: string; appId: string }
  | { ok: false; error: string; meta?: Record<string, unknown> }
> {
  const cleaned = token.replace(/^Bearer\s+/i, "").trim();
  if (!cleaned || cleaned.split(".").length < 3) {
    return { ok: false, error: "Token is not a JWT" };
  }

  let header: Record<string, unknown> = {};
  let claims: Record<string, unknown> = {};
  try {
    header = decodeProtectedHeader(cleaned) as Record<string, unknown>;
    claims = decodeJwt(cleaned) as Record<string, unknown>;
  } catch (e) {
    return {
      ok: false,
      error: `JWT decode failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const aud = claims.aud as string | string[] | undefined;
  const apps = candidateAppIds(aud);
  const errors: string[] = [];

  for (const appId of apps) {
    try {
      const key = await getVerifyKey(appId);
      const { payload } = await jwtVerify(cleaned, key, {
        issuer: "privy.io",
        audience: appId,
        algorithms: ["ES256"],
        clockTolerance: 120,
      });
      const userId = typeof payload.sub === "string" ? payload.sub : "";
      if (!userId) {
        errors.push(`${appId}: missing sub`);
        continue;
      }
      return { ok: true, userId, appId };
    } catch (e) {
      errors.push(
        `${appId}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  return {
    ok: false,
    error: errors[0] || "signature verification failed",
    meta: {
      alg: header.alg,
      typ: header.typ,
      iss: claims.iss,
      aud: claims.aud,
      sub: typeof claims.sub === "string" ? claims.sub.slice(0, 24) : null,
      exp: claims.exp,
      tried: apps,
      errors: errors.slice(0, 6),
    },
  };
}

async function fetchPrivyUser(
  privyId: string,
  appId: string
): Promise<PrivyIdentity> {
  const empty: PrivyIdentity = {
    privyId,
    twitter: null,
    github: null,
    wallets: [],
  };
  if (!appId || !PRIVY_APP_SECRET) return empty;
  try {
    const res = await fetch(
      `https://auth.privy.io/api/v1/users/${encodeURIComponent(privyId)}`,
      {
        headers: {
          Authorization: basicAuthHeader(appId, PRIVY_APP_SECRET),
          "privy-app-id": appId,
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
        // skip EVM
        if (!a.address.startsWith("0x") && !a.address.startsWith("0X")) {
          wallets.push(a.address);
        }
      }
    }
    return { privyId, twitter, github, wallets };
  } catch (e) {
    console.error("privy getUser failed", e);
    return empty;
  }
}

/**
 * Verify Privy access token from Authorization / x-privy-token / body.accessToken
 */
export async function requirePrivy(
  req: NextRequest,
  opts?: {
    twitter?: string | null;
    github?: string | null;
    wallet?: string | null;
    requireTwitter?: boolean;
    /** optional pre-parsed body so we don't consume stream twice */
    body?: Record<string, unknown> | null;
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

  const token = tokenFromRequest(req, opts?.body ?? null);
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
    console.error("privy jwt verify failed", verified.error, verified.meta);
    return {
      ok: false,
      res: Response.json(
        {
          error: "Invalid or expired session — log out and log back in",
          detail: verified.error,
          meta: verified.meta,
        },
        { status: 401 }
      ),
    };
  }

  const id = await fetchPrivyUser(verified.userId, verified.appId);

  if (opts?.requireTwitter) {
    if (!id.twitter) {
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
