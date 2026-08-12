import { type NextRequest } from "next/server";
import { decodeJwt, decodeProtectedHeader } from "jose";

export const dynamic = "force-dynamic";

function b64urlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Pure WebCrypto ES256 JWT verify — no jose remote/Node https. */
async function webcryptoVerifyEs256(
  token: string,
  jwk: JsonWebKey
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return { ok: false, error: "bad jwt parts" };
    const data = new TextEncoder().encode(`${h}.${p}`);
    const sig = b64urlToBytes(s);
    const key = await crypto.subtle.importKey(
      "jwk",
      { ...jwk, key_ops: ["verify"], ext: true },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"]
    );
    // JWT ES256 uses raw R||S; WebCrypto wants IEEE P1363 (also R||S for P-256)
    const ok = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      sig as BufferSource,
      data
    );
    return ok ? { ok: true } : { ok: false, error: "webcrypto verify false" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function GET() {
  const appId =
    process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID || "";
  let jwks: { keys?: Array<{ kid?: string; alg?: string; x?: string }> } = {};
  let jwksErr: string | null = null;
  try {
    const res = await fetch(
      `https://auth.privy.io/api/v1/apps/${appId}/jwks.json`
    );
    jwks = await res.json();
  } catch (e) {
    jwksErr = e instanceof Error ? e.message : String(e);
  }
  return Response.json({
    appId,
    jwksErr,
    kids: (jwks.keys || []).map((k) => k.kid),
    x0: jwks.keys?.[0]?.x?.slice(0, 12) || null,
    hasSubtle: typeof crypto !== "undefined" && !!crypto.subtle,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token =
    (typeof body.accessToken === "string" && body.accessToken) ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  if (!token) {
    return Response.json({ error: "send accessToken" }, { status: 400 });
  }

  const appId =
    process.env.NEXT_PUBLIC_PRIVY_APP_ID || process.env.PRIVY_APP_ID || "";
  const header = decodeProtectedHeader(token);
  const claims = decodeJwt(token);

  const jwksRes = await fetch(
    `https://auth.privy.io/api/v1/apps/${appId}/jwks.json`
  );
  const jwks = (await jwksRes.json()) as {
    keys: Array<JsonWebKey & { kid?: string }>;
  };
  const jwk =
    jwks.keys.find((k) => k.kid === header.kid) || jwks.keys[0] || null;

  let web: { ok: true } | { ok: false; error: string } = {
    ok: false,
    error: "no jwk",
  };
  if (jwk) web = await webcryptoVerifyEs256(token, jwk);

  // also try jose importJWK path for comparison
  let joseResult: string = "skip";
  try {
    const { importJWK, jwtVerify } = await import("jose");
    if (jwk) {
      const key = await importJWK(jwk as import("jose").JWK, "ES256");
      await jwtVerify(token, key, {
        issuer: "privy.io",
        audience: appId,
        algorithms: ["ES256"],
      });
      joseResult = "ok";
    }
  } catch (e) {
    joseResult = e instanceof Error ? e.message : String(e);
  }

  return Response.json({
    webcrypto: web,
    jose: joseResult,
    header,
    aud: claims.aud,
    sub: claims.sub,
    jwkKid: jwk?.kid || null,
    jwkX: typeof jwk?.x === "string" ? jwk.x.slice(0, 16) : null,
  });
}
