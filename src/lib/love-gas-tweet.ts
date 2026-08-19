import { LOVE_GAS_TWEET } from "@/lib/shit-token";

/** Canonical form for exact match (case-insensitive, collapsed space). */
export function canonicalizeLoveTweet(text: string): string {
  return (
    String(text || "")
      .replace(/https?:\/\/t\.co\/\w+/gi, "")
      .replace(/https?:\/\/\S+/gi, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .normalize("NFKC")
      // allow TOKENSHIT[.]COM anti-link form
      .replace(/\[\.\]/g, ".")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase()
  );
}

/** Compare without emoji so 💩💚 optional / order-tolerant */
function stripEmoji(s: string): string {
  return s
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\uFE0F\u200D]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isExactLoveGasTweet(text: string): boolean {
  const got = canonicalizeLoveTweet(text);
  const want = canonicalizeLoveTweet(LOVE_GAS_TWEET);
  if (got === want) return true;
  // tolerate trailing punctuation
  const got2 = got.replace(/[.!?]+$/g, "").trim();
  if (got2 === want) return true;
  // core text match (emoji optional on either side)
  const g = stripEmoji(got2);
  const w = stripEmoji(want);
  return g === w && g.includes("DO YOU LOVE TOKENSHIT");
}

export { LOVE_GAS_TWEET };
