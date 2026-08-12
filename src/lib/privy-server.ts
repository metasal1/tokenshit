import {
  importJWK,
  importSPKI,
  jwtVerify,
  decodeJwt,
  decodeProtectedHeader,
  type KeyLike,
  type JWK,
} from "jose";
import type { NextRequest } from "next/server";

/**
 * Edge-safe Privy auth for Cloudflare Workers / OpenNext.
 *
 * DO NOT use jose.createRemoteJWKSet — it calls Node https.get which throws
 *   [unenv] https.get is not implemented yet!
 * on CF Workers. Fetch JWKS with global fetch + importJWK instead.
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

type JwksDoc = { keys: JWK[] };
const jwksDocCache = new Map<string, { at: number; doc: JwksDoc }>();
const jwkKeyCache = new Map<string, KeyLike>();
const JWKS_TTL_MS = 60 * 60 * 1000;

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

/** Workers-safe JWKS load via fetch (not Node https). */
async function loadJwksDoc(appId: string): Promise<JwksDoc> {
  const hit = jwksDocCache.get(appId);
  if (hit && Date.now() - hit.at < JWKS_TTL_MS) return hit.doc;
  const res = await fetch(
    `https://auth.privy.io/api/v1/apps/${encodeURIComponent(appId)}/jwks.json`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`JWKS HTTP ${res.status}`);
  }
  const doc = (await res.json()) as JwksDoc;
  if (!doc?.keys?.length) throw new Error("JWKS empty");
  jwksDocCache.set(appId, { at: Date.now(), doc });
  return doc;
}

async function getKeyFromJwks(
  appId: string,
  kid?: string
): Promise<KeyLike> {
  const cacheKey = `${appId}:${kid || "*"}`;
  if (jwkKeyCache.has(cacheKey)) return jwkKeyCache.get(cacheKey)!;

  const doc = await loadJwksDoc(appId);
  let jwk = kid ? doc.keys.find((k) => k.kid === kid) : undefined;
  if (!jwk) jwk = doc.keys.find((k) => k.alg === "ES256") || doc.keys[0];
  if (!jwk) throw new Error("no JWK");

  const key = await importJWK(jwk, jwk.alg || "ES256");
  jwkKeyCache.set(cacheKey, key);
  // also cache under actual kid
  if (jwk.kid) jwkKeyCache.set(`${appId}:${jwk.kid}`, key);
  return key;
}

async function getKeyFromSpki(appId: string): Promise<KeyLike | null> {
  const cacheKey = `spki:${appId}`;
  if (jwkKeyCache.has(cacheKey)) return jwkKeyCache.get(cacheKey)!;

  let pem = "";

  // 1) env map
  const mapRaw = process.env.PRIVY_VERIFICATION_KEYS_JSON || "";
  if (mapRaw) {
    try {
      const map = JSON.parse(mapRaw) as Record<string, string>;
      if (map[appId]) pem = normalizePem(map[appId]);
    } catch {
      /* ignore */
    }
  }

  // 2) single env
  if (!pem && appId === PRIVY_APP_ID && PRIVY_VERIFICATION_KEY) {
    pem = normalizePem(PRIVY_VERIFICATION_KEY);
  }

  // 3) live fetch app settings (Workers fetch works)
  if (!pem && PRIVY_APP_SECRET) {
    try {
      const res = await fetch(
        `https://auth.privy.io/api/v1/apps/${encodeURIComponent(appId)}`,
        {
          headers: {
            Authorization: basicAuthHeader(appId, PRIVY_APP_SECRET),
            "privy-app-id": appId,
          },
          cache: "no-store",
        }
      );
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
    jwkKeyCache.set(cacheKey, key);
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

  const kid = typeof header.kid === "string" ? header.kid : undefined;
  const aud = claims.aud as string | string[] | undefined;
  const apps = candidateAppIds(aud);
  const errors: string[] = [];

  for (const appId of apps) {
    // 1) Workers-safe JWKS via fetch + importJWK
    try {
      const key = await getKeyFromJwks(appId, kid);
      const { payload } = await jwtVerify(cleaned, key, {
        issuer: "privy.io",
        audience: appId,
        algorithms: ["ES256"],
        clockTolerance: 120,
      });
      const userId = typeof payload.sub === "string" ? payload.sub : "";
      if (userId) return { ok: true, userId, appId };
      errors.push(`${appId}/jwk: missing sub`);
    } catch (e) {
      errors.push(
        `${appId}/jwk: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    // 2) SPKI (env or live-fetched app settings)
    try {
      const key = await getKeyFromSpki(appId);
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
