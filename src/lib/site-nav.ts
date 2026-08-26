export type NavAccent = "neon" | "amber" | "sky" | undefined;

export type NavItem = {
  href: string;
  label: string;
  primary?: boolean;
  accent?: NavAccent;
  match?: "prefix" | "exact";
  badge?: string;
  emoji?: string;
};

export const SITE_NAV: NavItem[] = [
  { href: "/play", label: "Play", primary: true, accent: "neon", match: "prefix" },
  { href: "/claim", label: "Claim", primary: true, accent: "amber", match: "prefix" },
  {
    href: "/kols",
    label: "KOLs",
    primary: true,
    accent: "neon",
    match: "prefix",
    badge: "2.5K",
  },
  { href: "/memes", label: "Memes", primary: true, match: "prefix" },
  {
    href: "/referrals",
    label: "Refer",
    primary: true,
    match: "prefix",
  },
  { href: "/swap", label: "Buy", primary: false, match: "prefix" },
  { href: "/stats", label: "Stats", primary: false, match: "prefix" },
  { href: "/winners", label: "Winners", primary: false, match: "prefix" },
  { href: "/whales", label: "Whales", primary: false, match: "prefix" },
];

/** Mobile bottom dock */
export const MOBILE_DOCK: NavItem[] = [
  { href: "/play", label: "Play", accent: "neon" },
  { href: "/claim", label: "Claim", accent: "amber" },
  { href: "/kols", label: "KOLs", accent: "neon", badge: "2.5K" },
  { href: "/referrals", label: "Refer" },
];

export function navIsActive(pathname: string, item: NavItem): boolean {
  const path = pathname.split("?")[0] || "/";
  if (item.match === "exact") return path === item.href;
  if (item.href === "/") return path === "/";
  return path === item.href || path.startsWith(`${item.href}/`);
}
