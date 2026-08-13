/**
 * Brand cursors — neon target (HIT) / skull (SHIT).
 * Hotspot centered at 14,14 for 28×28 SVG.
 */

export const HIT_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'%3E%3Ccircle cx='16' cy='16' r='14' stroke='%2339ff14' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='9' stroke='%2339ff14' stroke-width='1.75'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%2339ff14'/%3E%3Cline x1='16' y1='2' x2='16' y2='7' stroke='%2339ff14' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='16' y1='25' x2='16' y2='30' stroke='%2339ff14' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='2' y1='16' x2='7' y2='16' stroke='%2339ff14' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='25' y1='16' x2='30' y2='16' stroke='%2339ff14' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 16 16, crosshair`;

export const SHIT_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'%3E%3Ccircle cx='16' cy='16' r='14' stroke='%23f87171' stroke-width='2'/%3E%3Ccircle cx='12' cy='14' r='1.6' fill='%23f87171'/%3E%3Ccircle cx='20' cy='14' r='1.6' fill='%23f87171'/%3E%3Cpath d='M11 21c1.5 2 3.2 3 5 3s3.5-1 5-3' stroke='%23f87171' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 16 16, pointer`;

export const NEON_POINTER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28' fill='none'%3E%3Cpath d='M6 4l14 10-7 1.5L10 24 6 4z' fill='%2339ff14' stroke='%230a0a0f' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 4 4, pointer`;

export function sideCursor(side: "hit" | "shit"): string {
  return side === "hit" ? HIT_CURSOR : SHIT_CURSOR;
}
