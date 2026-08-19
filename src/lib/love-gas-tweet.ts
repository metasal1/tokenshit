import { LOVE_GAS_TWEET } from "@/lib/shit-token";

/** Canonical form for exact match (case-insensitive, collapsed space). */
export function canonicalizeLoveTweet(text: string): string {
  return (
    String(text || "")
      .replace(/https?:\/\/t\.co\/\w+/gi, "")
      // normalize love URL — drop query/hash
      .replace(
        /https?:\/\/(?:www\.)?tokenshit\.com\/love(?:\?[^\s]*)?/gi,
        "https://tokenshit.com/love"
      )
      .replace(/https?:\/\/\S+/gi, (u) => {
        if (/tokenshit\.com\/love/i.test(u)) return "https://tokenshit.com/love";
        return "";
      })
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .normalize("NFKC")
      .replace(/\[\.\]/g, ".")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase()
  );
}

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
  const got2 = got.replace(/[.!?]+$/g, "").trim();
  if (got2 === want) return true;
  // core: I LOVE TOKENSHIT + love URL (+ optional @tokenshit_)
  const g = stripEmoji(got2);
  const w = stripEmoji(want);
  if (g === w) return true;
  const hasLove = /I LOVE TOKENSHIT/.test(g);
  const hasUrl = /TOKENSHIT\.COM\/LOVE/.test(g);
  const hasHandle = /@TOKENSHIT_/.test(g);
  return hasLove && hasUrl && hasHandle;
}

export { LOVE_GAS_TWEET };
