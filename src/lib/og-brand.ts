/** Shared Satori styles for TOKEN$HIT OG lockups — cream TOKEN/HIT + green $. */
import { BRAND } from "@/lib/brand";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_BG = BRAND.colors.background; // #0a0a0f

export function creamGlow(strong = false): string {
  // cream + gold halo (brand .neon-text)
  return strong
    ? "0 0 10px #fff8e7, 0 0 28px #fff8e7, 0 0 70px #f0c040, 0 0 120px #f0c040"
    : "0 0 6px #fff8e7, 0 0 18px #f0c040, 0 0 40px #f0c040";
}

export function dollarGlow(strong = false): string {
  return strong
    ? "0 0 10px #39ff14, 0 0 28px #39ff14, 0 0 70px #0fa, 0 0 120px #0fa"
    : "0 0 6px #39ff14, 0 0 18px #39ff14, 0 0 40px #0fa";
}

export const CREAM = BRAND.colors.wordmark; // #fff8e7
export const GREEN = BRAND.colors.wordmarkDollar; // #39ff14
export const MUTED = BRAND.colors.zinc400;
export const DIM = BRAND.colors.zinc500;
export const CARD = BRAND.colors.card;
export const BORDER = BRAND.colors.border;
export const TAGLINE = BRAND.tagline;
