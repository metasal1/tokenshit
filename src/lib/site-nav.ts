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
 * Product order:
 * 1 Play · 2 Claim · 3 Buy · 4 Boards
 * then Stats · Winners · Whales · Memes · Referrals
 * (Home = logo only — not a nav link)
 */
export const SITE_NAV: NavItem[] = [
  { href: "/play", label: "Play", primary: true, accent: "neon", match: "prefix" },
  { href: "/claim", label: "Claim", primary: true, accent: "amber", match: "prefix" },
  { href: "/swap", label: "Buy", primary: true, match: "prefix" },
  { href: "/boards", label: "Boards", primary: true, match: "prefix" },
  { href: "/stats", label: "Stats", primary: false, match: "prefix" },
  { href: "/winners", label: "Winners", primary: false, match: "prefix" },
  { href: "/whales", label: "Whales", primary: false, match: "prefix" },
  { href: "/memes", label: "Memes", primary: false, match: "prefix" },
  { href: "/referrals", label: "Referrals", primary: false, match: "prefix" },
];

/** Mobile bottom dock — max 4 */
export const MOBILE_DOCK: NavItem[] = [
  { href: "/play", label: "Play", accent: "neon" },
  { href: "/claim", label: "Claim", accent: "amber" },
  { href: "/swap", label: "Buy" },
  { href: "/boards", label: "Boards" },
];

export function navIsActive(pathname: string, item: NavItem): boolean {
  const path = pathname.split("?")[0] || "/";
  if (item.match === "exact") return path === item.href;
  if (item.href === "/") return path === "/";
  return path === item.href || path.startsWith(`${item.href}/`);
}
