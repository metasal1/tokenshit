import type { Metadata } from "next";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { SHIT_MINT, SHIT_SYMBOL, TREASURY_ADDRESS, X_HANDLE } from "@/lib/shit-token";

const SITE = "https://tokenshit.com";
/** Cache-bust when OG pack regenerates */
const OG_V = "3";

export type OgKey =
  | "default"
  | "home"
  | "claim"
  | "claims"
  | "memes"
  | "play"
  | "whales"
  | "winners"
  | "swap"
  | "stats"
  | "seeker"
  | "brand"
  | "referrals"
  | "search"
  | "terms"
  | "privacy"
  | "day"
  | "hour";

export function ogUrl(key: OgKey | string = "default"): string {
  const k = key.replace(/^\//, "").replace(/\//g, "-") || "default";
  return `${SITE}/brand/og/${k}.png?v=${OG_V}`;
}

export function ogImage(key: OgKey | string = "default", alt?: string) {
  return {
    url: ogUrl(key),
    width: 1200,
    height: 630,
    type: "image/png" as const,
    alt:
      alt ||
      "TOKEN$HIT — Every token is shit until proven otherwise.",
  };
}

/** Shared default OG card */
export const SITE_OG = ogImage("default");

const OG = ogUrl("default");

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "TOKEN$HIT — Every token is shit until proven otherwise",
    template: "%s · TOKEN$HIT",
  },
  description:
    "Every token is shit until proven otherwise. Play $SHIT OF THE DAY, vote HIT or SHIT on Solana assets, claim rewards, swap $TOKENSHIT.",
  applicationName: "TOKEN$HIT",
  authors: [{ name: "TOKEN$HIT", url: SITE }],
  creator: "@Tokenshit_",
  publisher: "TOKEN$HIT",
  keywords: [
    "TOKENSHIT",
    "TOKEN$HIT",
    "Solana",
    "HIT SHIT",
    "Tokens.xyz",
    "crypto vote",
    "Token-2022",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE,
    siteName: "TOKEN$HIT",
    title: "TOKEN$HIT — Every token is shit until proven otherwise",
    description:
      "Play $SHIT OF THE DAY. Vote HIT or SHIT on real Solana assets. Claim, swap, whales.",
    images: [SITE_OG],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Tokenshit_",
    creator: "@Tokenshit_",
    title: "TOKEN$HIT — Every token is shit until proven otherwise",
    description:
      "Play $SHIT OF THE DAY. Vote HIT or SHIT on real Solana assets.",
    images: [OG],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/brand/logo-mark-dark.png", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TOKEN$HIT",
  },
  other: {
    "ga-measurement-id": GA_MEASUREMENT_ID,
  },
};

/** Map path → og key */
export function ogKeyForPath(path: string): OgKey {
  const p = path.replace(/\/$/, "") || "/";
  const map: Record<string, OgKey> = {
    "/": "home",
    "/claim": "claim",
    "/claims": "claims",
    "/memes": "memes",
    "/play": "play",
    "/day": "day",
    "/hour": "hour",
    "/whales": "whales",
    "/winners": "winners",
    "/swap": "swap",
    "/stats": "stats",
    "/seeker": "seeker",
    "/brand": "brand",
    "/referrals": "referrals",
    "/search": "search",
    "/terms": "terms",
    "/privacy": "privacy",
  };
  return map[p] || "default";
}

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  /** Override OG art key (defaults from path) */
  og?: OgKey | string;
}): Metadata {
  const url = opts.path === "/" ? SITE : `${SITE}${opts.path}`;
  const key = opts.og || ogKeyForPath(opts.path);
  const img = ogImage(key, `${opts.title} · TOKEN$HIT`);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path === "/claims" ? "/claim" : opts.path },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: `${opts.title} · TOKEN$HIT`,
      description: opts.description,
      url: opts.path === "/claims" ? `${SITE}/claim` : url,
      siteName: "TOKEN$HIT",
      images: [img],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: "@Tokenshit_",
      creator: "@Tokenshit_",
      title: `${opts.title} · TOKEN$HIT`,
      description: opts.description,
      images: [img.url],
    },
  };
}

/** JSON-LD for homepage / layout */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE,
        name: "TOKEN$HIT",
        description:
          "Every token is shit until proven otherwise. HIT/SHIT on Solana.",
        publisher: { "@id": `${SITE}/#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE}/#org`,
        name: "TOKEN$HIT",
        url: SITE,
        logo: `${SITE}/brand/logo-mark.png`,
        sameAs: [`https://x.com/${X_HANDLE}`],
      },
      {
        "@type": "WebApplication",
        name: "TOKEN$HIT",
        url: SITE,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web, Android, iOS",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };
}

export { SITE, SHIT_MINT, SHIT_SYMBOL, TREASURY_ADDRESS };
