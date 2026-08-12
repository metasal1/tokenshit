/**
 * TOKENSHIT brand tokens — single source of truth.
 * Keep in sync with globals.css (.neon-text / .neon-dollar) + logo PNGs.
 *
 * Dark-mode lockup (canonical):
 *   TOKEN / HIT = cream #fff8e7 (+ gold glow #f0c040)
 *   $           = neon green #39ff14
 *   bg          = #0a0a0f
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
  typefullySocialSetId: 326045,

  colors: {
    background: "#0a0a0f",
    foreground: "#e4e4e7",
    /** Primary CTA green — also the $ in the wordmark */
    neon: "#39ff14",
    neonDim: "#39ff1440",
    neonPurple: "#b94dff",
    neonBlue: "#00d4ff",
    neonMagenta: "#ff00ff",
    neonMagentaGlow: "#bc13fe",
    /** Wordmark TOKEN/HIT cream neon (dark mode default) */
    wordmark: "#fff8e7",
    wordmarkGlow: "#f0c040",
    /** Wordmark $ green */
    wordmarkDollar: "#39ff14",
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
    tokenClass: "neon-text",
    dollarClass: "neon-dollar",
    hitClass: "neon-text",
    fontClass: "font-monoton",
    assets: {
      logoPng: "/brand/logo.png",
      logoTransparent: "/brand/logo-transparent.png",
      logoWide: "/brand/logo-wide.png",
      logoSquare: "/brand/logo-square.png",
      logoSquareTransparent: "/brand/logo-square-transparent.png",
      logoMark: "/brand/logo-mark.png",
      logoMarkDark: "/brand/logo-mark-dark.png",
      logoRoot: "/logo.png",
      iconSvg: "/brand/icon.svg",
      squareSolid: "/brand/square-solid.png",
      squareOutline: "/brand/square-outline.png",
      squareGradient: "/brand/square-gradient.png",
      logoJpg: "/logo.jpg",
      banner: "/banner.jpeg",
      xBanner: "/brand/x-banner.jpg",
      ogImage: "/brand/og-image.png",
      ogShare: "/brand/og-share.png",
    },
  },

  voice: {
    tone: ["irreverent", "direct", "CT-native", "funny-not-cringe"],
    do: [
      "Bare logos — no boxes, no chrome frames on shares",
      "Cream TOKEN/HIT + green $ on dark (never green wordmark + magenta $)",
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
      "Don't paint TOKEN/HIT green or $ magenta",
      "No default/generic emojis in UI, emails, TG alerts, or X copy",
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
  {
    key: "wordmark",
    hex: BRAND.colors.wordmark,
    role: "TOKEN / HIT cream neon",
  },
  {
    key: "wordmarkGlow",
    hex: BRAND.colors.wordmarkGlow,
    role: "Wordmark gold glow",
  },
  {
    key: "wordmarkDollar / neon",
    hex: BRAND.colors.wordmarkDollar,
    role: "$ + primary CTA green",
  },
  { key: "neonBlue", hex: BRAND.colors.neonBlue, role: "Links / info" },
  { key: "neonPurple", hex: BRAND.colors.neonPurple, role: "Selection" },
  { key: "hit", hex: BRAND.colors.hit, role: "HIT vote" },
  { key: "shit", hex: BRAND.colors.shit, role: "SHIT vote" },
];
