import type { Metadata } from "next";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { SHIT_MINT, SHIT_SYMBOL, TREASURY_ADDRESS, X_HANDLE } from "@/lib/shit-token";

const SITE = "https://tokenshit.com";
const OG = `${SITE}/brand/og-share.png?v=2`;

/** Shared OG card — static PNG only (no dual opengraph-image noise). */
export const SITE_OG = {
  url: OG,
  width: 1200,
  height: 630,
  type: "image/png" as const,
  alt: "TOKEN$HIT — Every token is shit until proven otherwise.",
};

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

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = opts.path === "/" ? SITE : `${SITE}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: `${opts.title} · TOKEN$HIT`,
      description: opts.description,
      url,
      siteName: "TOKEN$HIT",
      images: [SITE_OG],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: "@Tokenshit_",
      creator: "@Tokenshit_",
      title: `${opts.title} · TOKEN$HIT`,
      description: opts.description,
      images: [OG],
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
          "Every token is shit until proven otherwise. HIT/SHIT on Solana assets.",
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
        logo: `${SITE}/icons/icon-512.png`,
        sameAs: [
          `https://x.com/${X_HANDLE}`,
          "https://github.com/solana-foundation/tokens",
        ],
        description:
          "HIT/SHIT court for Solana Foundation registry tokens. $TOKENSHIT.",
      },
      {
        "@type": "WebApplication",
        name: "TOKEN$HIT",
        url: SITE,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FinancialProduct",
        name: "$TOKENSHIT",
        description: "TokenShit (TOKENSHIT) on Solana Token-2022",
        url: `${SITE}/swap`,
        identifier: SHIT_MINT,
      },
    ],
  };
}

export { SITE, OG, SHIT_MINT, SHIT_SYMBOL, TREASURY_ADDRESS };
