/**
 * TOKENSHIT brand tokens — single source of truth.
 * Keep in sync with globals.css @theme + layout fonts.
 */

export const BRAND = {
  name: "TOKENSHIT",
  nameDisplay: "TOKEN$HIT",
  wordmark: "TOKEN$HIT",
  tagline: "Every token is shit until proven otherwise.",
  shortTagline: "HIT or SHIT. Court is in session.",
  ticker: "TOKENSHIT",
  tickerDisplay: "$TOKENSHIT",
  site: "https://tokenshit.com",
  x: "https://x.com/Tokenshit_",
  xHandle: "Tokenshit_",
  mint: "fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit",
  treasury: "SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB",

  colors: {
    background: "#0a0a0f",
    foreground: "#e4e4e7",
    neon: "#39ff14",
    neonDim: "#39ff1440",
    neonPurple: "#b94dff",
    neonBlue: "#00d4ff",
    neonMagenta: "#ff00ff",
    neonMagentaGlow: "#bc13fe",
    card: "#12121a",
    cardHover: "#1a1a2e",
    border: "#2a2a3a",
    zinc400: "#a1a1aa",
    zinc500: "#71717a",
    zinc600: "#52525b",
    hit: "#4ade80",
    shit: "#f87171",
    black: "#000000",
    white: "#ffffff",
  },

  fonts: {
    brand: "Monoton",
    display: "Orbitron",
    sans: "Geist",
    mono: "Geist Mono",
  },

  logo: {
    /** CSS classes for wordmark pieces */
    tokenClass: "neon-text",
    dollarClass: "neon-dollar",
    hitClass: "neon-text",
    fontClass: "font-monoton",
    /** Public assets (bare logos — no boxes in shares) */
    assets: {
      iconSvg: "/brand/icon.svg",
      squareSolid: "/brand/square-solid.png",
      squareOutline: "/brand/square-outline.png",
      squareGradient: "/brand/square-gradient.png",
      logoJpg: "/logo.jpg",
      logoNeon: "/logo-neon.jpg",
      banner: "/banner.jpeg",
      posterTreasury: "/posters/treasury-reloaded.png",
    },
  },

  voice: {
    tone: ["irreverent", "direct", "CT-native", "funny-not-cringe"],
    do: [
      "Bare logos — no boxes, no chrome frames on shares",
      "Lowercase sentence case for body; ALL CAPS only for brand lockups",
      "Use HIT / SHIT as verdict verbs",
      "Link product (token page, claim, ref) not empty vibes",
      "Neon green primary CTA on dark",
    ],
    dont: [
      "No hashtags on X",
      "No auto-post without approval",
      "No Drake spam / lame daily meme cron",
      "No purple mainnet Solana palette as primary brand",
      "No scientific notation on prices in UI",
      "Don't say $SHIT ticker — ticker is $TOKENSHIT",
    ],
  },

  usage: {
    primaryCta: "bg-neon text-black font-semibold",
    card: "rounded-xl border border-border bg-card",
    link: "text-neon-blue hover:underline",
    mono: "font-mono tabular-nums",
  },
} as const;

export type BrandColorKey = keyof typeof BRAND.colors;

export const BRAND_COLOR_SWATCHES: {
  key: string;
  hex: string;
  role: string;
}[] = [
  { key: "background", hex: BRAND.colors.background, role: "Page / void" },
  { key: "card", hex: BRAND.colors.card, role: "Surfaces" },
  { key: "border", hex: BRAND.colors.border, role: "Dividers" },
  { key: "foreground", hex: BRAND.colors.foreground, role: "Body text" },
  { key: "neon", hex: BRAND.colors.neon, role: "Primary brand / CTA" },
  { key: "neonBlue", hex: BRAND.colors.neonBlue, role: "Links / info" },
  { key: "neonPurple", hex: BRAND.colors.neonPurple, role: "Selection / accent" },
  { key: "neonMagenta", hex: BRAND.colors.neonMagenta, role: "Dollar / glitch S" },
  { key: "hit", hex: BRAND.colors.hit, role: "HIT vote" },
  { key: "shit", hex: BRAND.colors.shit, role: "SHIT vote" },
];
