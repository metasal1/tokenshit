/**
 * Whale watch labels + constants for $TOKENSHIT.
 */
export const WHALE_MINT =
  "fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit" as const;

export const WHALE_POOL =
  "CE1jsMZSYWaQomQ7JbuHa4ptNCH75qJKMtfh4paNQo2w" as const;

export const WHALE_POOL_METEORA =
  "DzTPVjJcvHYesXcgQWkyjmCpxyfpdAESACiVUfKQK4xm" as const;

/** Metasal ~15% bag — never label as YOU on public UI */
export const WHALE_YOU =
  "GaxVqiQyJKQDRu6H4pfy9V6Xq19pHGr6HQKDQDv911Y4" as const;

export const WHALE_TRADES_WORKER =
  process.env.TOKENSHIT_TRADES_URL ||
  "https://tokenshit-trades.gm-4e8.workers.dev";

export const WHALE_LABELS: Record<string, string> = {
  [WHALE_POOL]: "Pool (PumpSwap)",
  [WHALE_POOL_METEORA]: "Pool (Meteora)",
  SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB: "Treasury",
  // private bag — no public "YOU" label on site
};

export function labelWallet(owner: string): string | null {
  return WHALE_LABELS[owner] || null;
}

export function shortAddr(a: string, n = 4): string {
  if (!a || a.length < 10) return a || "—";
  return `${a.slice(0, n)}…${a.slice(-n)}`;
}

export function fmtHold(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec) || sec < 0) return "—";
  if (sec < 60) return `${Math.floor(sec)}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  return h ? `${d}d ${h}h` : `${d}d`;
}

export function fmtTokenAmount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function solscanAccount(addr: string): string {
  return `https://solscan.io/account/${addr}`;
}

/** Portfolio on sol.new — prefers SNS/ADNS name when present. */
export function solnewPortfolio(addrOrDomain: string): string {
  const s = (addrOrDomain || "").trim();
  if (!s) return "https://sol.new/portfolio";
  return `https://sol.new/portfolio/${encodeURIComponent(s)}`;
}

/** Display label: infra label > domain > short address */
export function displayWalletLabel(opts: {
  owner: string;
  label?: string | null;
  domain?: string | null;
}): string {
  if (opts.label) return opts.label;
  if (opts.domain) return opts.domain;
  return shortAddr(opts.owner, 5);
}
