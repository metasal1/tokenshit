/** Shared site nav — single source of truth for header + mobile. */

export type NavItem = {
  href: string;
  label: string;
  /** Show in desktop primary strip */
  primary?: boolean;
  /** Emphasize (Play / Claim) */
  accent?: "neon" | "amber" | null;
  match?: "exact" | "prefix";
};

/**
 * Primary CTA order (Metasal): Play · Claim · Memes · Refer
 * More: Boards · Buy · Stats · Winners · Whales
 */
export const SITE_NAV: NavItem[] = [
  { href: "/play", label: "Play", primary: true, accent: "neon", match: "prefix" },
  { href: "/claim", label: "Claim", primary: true, accent: "amber", match: "prefix" },
  { href: "/memes", label: "Memes", primary: true, match: "prefix" },
  {
    href: "/referrals",
    label: "Refer",
    primary: true,
    match: "prefix",
  },
  { href: "/boards", label: "Boards", primary: false, match: "prefix" },
  { href: "/swap", label: "Buy", primary: false, match: "prefix" },
  { href: "/stats", label: "Stats", primary: false, match: "prefix" },
  { href: "/winners", label: "Winners", primary: false, match: "prefix" },
  { href: "/whales", label: "Whales", primary: false, match: "prefix" },
];

/** Mobile bottom dock — same CTA order */
export const MOBILE_DOCK: NavItem[] = [
  { href: "/play", label: "Play", accent: "neon" },
  { href: "/claim", label: "Claim", accent: "amber" },
  { href: "/memes", label: "Memes" },
  { href: "/referrals", label: "Refer" },
];

export function navIsActive(pathname: string, item: NavItem): boolean {
  const path = pathname.split("?")[0] || "/";
  if (item.match === "exact") return path === item.href;
  if (item.href === "/") return path === "/";
  return path === item.href || path.startsWith(`${item.href}/`);
}
