import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security + canonical host:
 * - force HTTPS (x-forwarded-proto)
 * - www → apex
 * - baseline browser security headers
 */
export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  const proto = (
    request.headers.get("x-forwarded-proto") ||
    request.nextUrl.protocol.replace(":", "") ||
    "https"
  ).toLowerCase();

  // Always HTTPS on production hosts
  if (
    (host === "tokenshit.com" || host === "www.tokenshit.com") &&
    proto === "http"
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "tokenshit.com";
    return withSecurityHeaders(NextResponse.redirect(url, 308));
  }

  // Apex canonical
  if (host === "www.tokenshit.com") {
    const url = request.nextUrl.clone();
    url.host = "tokenshit.com";
    url.protocol = "https:";
    return withSecurityHeaders(NextResponse.redirect(url, 308));
  }

  return withSecurityHeaders(NextResponse.next());
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.delete("X-Powered-By");
  res.headers.set("X-Powered-By", "");
  // HSTS — 180d; CF zone also sets this
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=15552000; includeSubDomains; preload"
  );
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self), usb=()"
  );
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.headers.set("X-DNS-Prefetch-Control", "on");
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.privy.io https://auth.privy.io https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: wss: https://*.privy.io https://auth.privy.io https://api.mainnet-beta.solana.com wss://api.mainnet-beta.solana.com https://quote-api.jup.ag https://api.jup.ag https://lite-api.jup.ag https://api.tokens.xyz https://api.dexscreener.com https://api.coingecko.com https://www.google-analytics.com https://region1.google-analytics.com https://*.turso.io",
      "frame-src 'self' https://*.privy.io https://auth.privy.io https://challenges.cloudflare.com https://*.moonpay.com https://buy.moonpay.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://*.privy.io",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ")
  );
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
