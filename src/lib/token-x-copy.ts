import { PLAY_PRODUCT } from "@/lib/hour-product";
import { TOKEN_X_BY_ID, TOKEN_X_BY_SYM } from "@/lib/token-x-known";

const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;

export function normalizeXHandle(raw: string | null | undefined): string {
  const h = String(raw || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .trim();
  if (!HANDLE_RE.test(h)) return "";
  if (h.toLowerCase() === "tokenshit_") return "";
  return h;
}

export function knownTokenX(
  assetId?: string | null,
  symbol?: string | null
): string {
  const id = String(assetId || "")
    .trim()
    .toLowerCase();
  if (id && TOKEN_X_BY_ID[id]) return TOKEN_X_BY_ID[id];
  const sym = String(symbol || "")
    .trim()
    .replace(/^\$/, "")
    .toUpperCase();
  if (sym && TOKEN_X_BY_SYM[sym]) return TOKEN_X_BY_SYM[sym];
  return "";
}

function cashtag(symbol: string): string {
  const t = String(symbol || "")
    .replace(/^\$/, "")
    .trim()
    .toUpperCase();
  return t ? `$${t}` : "$?";
}

function shortAddr(w: string | null | undefined): string {
  if (!w) return "";
  if (w.length < 12) return w;
  return `${w.slice(0, 4)}…${w.slice(-4)}`;
}

function fmtPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function sideLine(opts: {
  side: "HIT" | "SHIT";
  symbol: string;
  handle?: string | null;
  pct: number | null;
  winner: string | null;
  prize: number | null;
}): string {
  const tag = cashtag(opts.symbol);
  const at = normalizeXHandle(opts.handle) || knownTokenX(undefined, opts.symbol);
  const who = opts.winner
    ? shortAddr(opts.winner)
    : opts.prize && opts.prize > 0
      ? "house"
      : "empty";
  const prize =
    opts.winner && opts.prize && opts.prize > 0
      ? ` · ${Math.round(opts.prize).toLocaleString()} $TOKENSHIT`
      : "";
  return `${opts.side} ${tag}${at ? ` @${at}` : ""} ${fmtPct(opts.pct)} → ${who}${prize}`;
}

export type SettleSide = {
  symbol: string;
  handle?: string | null;
  pct: number | null;
  winner: string | null;
  prize: number | null;
};

export function hourSettleTweet(opts: {
  hit: SettleSide;
  shit: SettleSide;
}): string {
  return [
    `${PLAY_PRODUCT.tweetName} just settled on @Tokenshit_`,
    "",
    sideLine({ side: "HIT", ...opts.hit }),
    sideLine({ side: "SHIT", ...opts.shit }),
    "",
    `Winners + payouts → https://tokenshit.com/winners`,
  ].join("\n");
}
