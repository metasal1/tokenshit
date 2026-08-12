import { decodeJwt, decodeProtectedHeader } from "jose";
import type { NextRequest } from "next/server";

/**
 * Edge-safe Privy auth for Cloudflare Workers / OpenNext.
 *
 * CRITICAL: `jose.jwtVerify` + `importJWK`/`importSPKI` fails signature checks
 * on CF Workers (unenv / subtle mismatch) even when the same token verifies
 * with pure `crypto.subtle`. Use WebCrypto ECDSA P-256 verify only.
 */

const PRIVY_APP_ID = (
  process.env.NEXT_PUBLIC_PRIVY_APP_ID ||
  process.env.PRIVY_APP_ID ||
  ""
).trim();
const PRIVY_APP_SECRET = (process.env.PRIVY_APP_SECRET || "").trim();
const PRIVY_APP_ID_FALLBACK = (process.env.PRIVY_APP_ID_FALLBACK || "").trim();

export type PrivyIdentity = {
  privyId: string;
  twitter: string | null;
  github: string | null;
  wallets: string[];
};

type Jwk = JsonWebKey & { kid?: string; alg?: string };
type JwksDoc = { keys: Jwk[] };

const jwksDocCache = new Map<string, { at: number; doc: JwksDoc }>();
const cryptoKeyCache = new Map<string, CryptoKey>();
const JWKS_TTL_MS = 60 * 60 * 1000;

function basicAuthHeader(appId: string, secret: string): string {
  const raw = `${appId}:${secret}`;
  try {
    return `Basic ${btoa(raw)}`;
  } catch {
    return `Basic ${Buffer.from(raw, "utf8").toString("base64")}`;
  }
}

/** Keep for health endpoint / env tooling */
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

function b64urlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function loadJwksDoc(appId: string): Promise<JwksDoc> {
  const hit = jwksDocCache.get(appId);
  if (hit && Date.now() - hit.at < JWKS_TTL_MS) return hit.doc;
  const res = await fetch(
    `https://auth.privy.io/api/v1/apps/${encodeURIComponent(appId)}/jwks.json`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`JWKS HTTP ${res.status}`);
  const doc = (await res.json()) as JwksDoc;
  if (!doc?.keys?.length) throw new Error("JWKS empty");
  jwksDocCache.set(appId, { at: Date.now(), doc });
  return doc;
}

async function getCryptoKey(appId: string, kid?: string): Promise<CryptoKey> {
  const cacheKey = `${appId}:${kid || "*"}`;
  if (cryptoKeyCache.has(cacheKey)) return cryptoKeyCache.get(cacheKey)!;

  const doc = await loadJwksDoc(appId);
  let jwk = kid ? doc.keys.find((k) => k.kid === kid) : undefined;
  if (!jwk) jwk = doc.keys.find((k) => k.alg === "ES256") || doc.keys[0];
  if (!jwk) throw new Error("no JWK");

  const key = await crypto.subtle.importKey(
    "jwk",
    { ...jwk, key_ops: ["verify"], ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );
  cryptoKeyCache.set(cacheKey, key);
  if (jwk.kid) cryptoKeyCache.set(`${appId}:${jwk.kid}`, key);
  return key;
}

/** Pure WebCrypto ES256 JWT verify (Workers-safe). */
async function webcryptoJwtVerifyEs256(
  token: string,
  key: CryptoKey
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [h, p, s] = parts;
  const data = new TextEncoder().encode(`${h}.${p}`);
  const sig = b64urlToBytes(s);
  return crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    sig as BufferSource,
    data
  );
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

  if (header.alg && header.alg !== "ES256") {
    return { ok: false, error: `Unsupported alg ${String(header.alg)}` };
  }

  // exp check (clockTolerance 120s)
  const now = Math.floor(Date.now() / 1000);
  const exp = typeof claims.exp === "number" ? claims.exp : 0;
  const iat = typeof claims.iat === "number" ? claims.iat : 0;
  if (exp && now > exp + 120) {
    return { ok: false, error: "token expired" };
  }
  if (iat && iat > now + 120) {
    return { ok: false, error: "token nbf/iat in future" };
  }
  if (claims.iss && claims.iss !== "privy.io") {
    return { ok: false, error: `bad iss ${String(claims.iss)}` };
  }

  const kid = typeof header.kid === "string" ? header.kid : undefined;
  const aud = claims.aud as string | string[] | undefined;
  const apps = candidateAppIds(aud);
  const errors: string[] = [];

  for (const appId of apps) {
    // audience must match when present
    const audOk = !aud
      ? true
      : Array.isArray(aud)
        ? aud.includes(appId)
        : aud === appId;
    if (!audOk) {
      errors.push(`${appId}: aud mismatch`);
      continue;
    }

    try {
      const key = await getCryptoKey(appId, kid);
      const ok = await webcryptoJwtVerifyEs256(cleaned, key);
      if (!ok) {
        errors.push(`${appId}/webcrypto: signature invalid`);
        continue;
      }
      const userId = typeof claims.sub === "string" ? claims.sub : "";
      if (!userId) {
        errors.push(`${appId}: missing sub`);
        continue;
      }
      return { ok: true, userId, appId };
    } catch (e) {
      errors.push(
        `${appId}/webcrypto: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  return {
    ok: false,
    error: errors[0] || "signature verification failed",
    meta: {
      alg: header.alg,
      kid: header.kid,
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
    /** Wallet must appear on the Privy user's linked Solana accounts */
    requireLinkedWallet?: boolean;
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

  if (opts?.requireTwitter !== false) {
    // default: X compulsory when flag omitted? only when true
  }
  if (opts?.requireTwitter) {
    if (!id.twitter) {
      return {
        ok: false,
        res: Response.json(
          { error: "Sign in with X is required — link X in Privy" },
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

  if (opts?.requireLinkedWallet) {
    if (!id.wallets.length) {
      return {
        ok: false,
        res: Response.json(
          {
            error:
              "No Solana wallet on this Privy account. Create/link a wallet while signed in with X.",
          },
          { status: 403 }
        ),
      };
    }
    if (opts.wallet) {
      const want = opts.wallet.trim();
      const ok = id.wallets.some(
        (w) => w.toLowerCase() === want.toLowerCase()
      );
      if (!ok) {
        return {
          ok: false,
          res: Response.json(
            {
              error:
                "Payout wallet must be the Privy Solana wallet linked to your X account",
              linkedWallets: id.wallets.map(
                (w) => `${w.slice(0, 4)}…${w.slice(-4)}`
              ),
            },
            { status: 403 }
          ),
        };
      }
    }
  }

  return { ok: true, id };
}
