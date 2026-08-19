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

export function isExactLoveGasTweet(text: string): boolean {
  const got = canonicalizeLoveTweet(text);
  const want = canonicalizeLoveTweet(LOVE_GAS_TWEET);
  if (got === want) return true;
  // tolerate trailing punctuation X sometimes adds
  const got2 = got.replace(/[.!?]+$/g, "").trim();
  return got2 === want;
}

export { LOVE_GAS_TWEET };
