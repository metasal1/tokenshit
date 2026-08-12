import {
  createRemoteJWKSet,
  importSPKI,
  jwtVerify,
  decodeJwt,
  decodeProtectedHeader,
  type JWTVerifyGetKey,
  type KeyLike,
} from "jose";
import type { NextRequest } from "next/server";

/**
 * Edge-safe Privy auth for Cloudflare Workers.
 *
 * Prefer JWKS (remote) — PEM secrets get mangled by wrangler multi-line storage.
 * Real access tokens verify with:
 *   jose.createRemoteJWKSet(https://auth.privy.io/api/v1/apps/{appId}/jwks.json)
 */

const PRIVY_APP_ID = (
  process.env.NEXT_PUBLIC_PRIVY_APP_ID ||
  process.env.PRIVY_APP_ID ||
  ""
).trim();
const PRIVY_APP_SECRET = (process.env.PRIVY_APP_SECRET || "").trim();
const PRIVY_VERIFICATION_KEY = (process.env.PRIVY_VERIFICATION_KEY || "").trim();
const PRIVY_APP_ID_FALLBACK = (process.env.PRIVY_APP_ID_FALLBACK || "").trim();

export type PrivyIdentity = {
  privyId: string;
  twitter: string | null;
  github: string | null;
  wallets: string[];
};

const jwksCache = new Map<string, JWTVerifyGetKey>();
const spkiCache = new Map<string, KeyLike>();

function basicAuthHeader(appId: string, secret: string): string {
  const raw = `${appId}:${secret}`;
  try {
    return `Basic ${btoa(raw)}`;
  } catch {
    return `Basic ${Buffer.from(raw, "utf8").toString("base64")}`;
  }
}

export function normalizePem(input: string): string {
  let pem = input.trim().replace(/\\n/g, "\n").replace(/\r/g, "");
  if (!pem.includes("BEGIN PUBLIC KEY")) {
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
    for (let i = 0; i < body.length; i += 64) lines.push(body.slice(i, i + 64));
    lines.push("-----END PUBLIC KEY-----");
    pem = lines.join("\n");
  }
  return pem;
}

function getJwks(appId: string): JWTVerifyGetKey {
  let jwks = jwksCache.get(appId);
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`)
    );
    jwksCache.set(appId, jwks);
  }
  return jwks;
}

async function getSpkiFallback(appId: string): Promise<KeyLike | null> {
  if (spkiCache.has(appId)) return spkiCache.get(appId)!;

  // map secret
  const mapRaw = process.env.PRIVY_VERIFICATION_KEYS_JSON || "";
  let pem = "";
  if (mapRaw) {
    try {
      const map = JSON.parse(mapRaw) as Record<string, string>;
      if (map[appId]) pem = normalizePem(map[appId]);
    } catch {
      /* ignore */
    }
  }
  if (!pem && appId === PRIVY_APP_ID && PRIVY_VERIFICATION_KEY) {
    pem = normalizePem(PRIVY_VERIFICATION_KEY);
  }
  if (!pem && PRIVY_APP_SECRET) {
    try {
      const res = await fetch(`https://auth.privy.io/api/v1/apps/${appId}`, {
        headers: {
          Authorization: basicAuthHeader(appId, PRIVY_APP_SECRET),
          "privy-app-id": appId,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { verification_key?: string };
        if (data.verification_key) pem = normalizePem(data.verification_key);
      }
    } catch {
      /* ignore */
    }
  }
  if (!pem) return null;
  try {
    const key = await importSPKI(pem, "ES256");
    spkiCache.set(appId, key);
    return key;
  } catch {
    return null;
  }
}

export function bearerFrom(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
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

export function tokenFromRequest(
  req: NextRequest,
  body?: Record<string, unknown> | null
): string | null {
  const header = bearerFrom(req);
  if (header) return header;
  if (body) {
    const t =
      body.accessToken || body.privyToken || body.token || body.idToken;
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
  push("cmdz9woca0012ky0bgpyfqept");
  push("cmn9qofoh00z50cjuijtbyf10");
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
    // 1) JWKS (primary — works on CF Workers)
    try {
      const jwks = getJwks(appId);
      const { payload } = await jwtVerify(cleaned, jwks, {
        issuer: "privy.io",
        audience: appId,
        algorithms: ["ES256"],
        clockTolerance: 120,
      });
      const userId = typeof payload.sub === "string" ? payload.sub : "";
      if (userId) return { ok: true, userId, appId };
      errors.push(`${appId}/jwks: missing sub`);
    } catch (e) {
      errors.push(
        `${appId}/jwks: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    // 2) SPKI PEM fallback
    try {
      const key = await getSpkiFallback(appId);
      if (!key) {
        errors.push(`${appId}/spki: no key`);
        continue;
      }
      const { payload } = await jwtVerify(cleaned, key, {
        issuer: "privy.io",
        audience: appId,
        algorithms: ["ES256"],
        clockTolerance: 120,
      });
      const userId = typeof payload.sub === "string" ? payload.sub : "";
      if (userId) return { ok: true, userId, appId };
      errors.push(`${appId}/spki: missing sub`);
    } catch (e) {
      errors.push(
        `${appId}/spki: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  return {
    ok: false,
    error: errors[0] || "signature verification failed",
    meta: {
      alg: header.alg,
      kid: header.kid,
      typ: header.typ,
      iss: claims.iss,
      aud: claims.aud,
      sub: typeof claims.sub === "string" ? claims.sub.slice(0, 28) : null,
      exp: claims.exp,
      tried: apps,
      errors: errors.slice(0, 8),
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
          t.includes("solana")) &&
        !a.address.startsWith("0x") &&
        !a.address.startsWith("0X")
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

export async function requirePrivy(
  req: NextRequest,
  opts?: {
    twitter?: string | null;
    github?: string | null;
    wallet?: string | null;
    requireTwitter?: boolean;
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
