/**
 * Brand cursors — consistent app-wide.
 * Hotspots tuned per glyph.
 *
 * - default / pointer: neon arrow
 * - hit: green target
 * - shit: red skull-ish face
 * - grab / grabbing: for meme stage
 * - text: caret
 * - disabled: not-allowed
 */

const neonArrow = (fill: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28' fill='none'%3E%3Cpath d='M6 4l14 10-7 1.5L10 24 6 4z' fill='${encodeURIComponent(fill)}' stroke='%230a0a0f' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 4 4`;

const hitSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'%3E%3Ccircle cx='16' cy='16' r='14' stroke='%2339ff14' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='9' stroke='%2339ff14' stroke-width='1.75'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%2339ff14'/%3E%3Cline x1='16' y1='2' x2='16' y2='7' stroke='%2339ff14' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='16' y1='25' x2='16' y2='30' stroke='%2339ff14' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='2' y1='16' x2='7' y2='16' stroke='%2339ff14' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='25' y1='16' x2='30' y2='16' stroke='%2339ff14' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 16 16`;

const shitSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'%3E%3Ccircle cx='16' cy='16' r='14' stroke='%23f87171' stroke-width='2'/%3E%3Ccircle cx='12' cy='14' r='1.6' fill='%23f87171'/%3E%3Ccircle cx='20' cy='14' r='1.6' fill='%23f87171'/%3E%3Cpath d='M11 21c1.5 2 3.2 3 5 3s3.5-1 5-3' stroke='%23f87171' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 16 16`;

const grabSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'%3E%3Cpath d='M11 14V9.5a1.5 1.5 0 013 0V14M14 14V8.5a1.5 1.5 0 013 0V14M17 14v-4a1.5 1.5 0 013 0v6.5c0 3-2 5.5-5.5 5.5S9 19.5 9 16.5V15a1.5 1.5 0 013 0v-1' stroke='%2339ff14' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 16 16`;

const grabActiveSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'%3E%3Cpath d='M10 15.5V13a1.2 1.2 0 012.4 0v2.5M12.4 15V11.5a1.2 1.2 0 012.4 0V15M14.8 14.5v-2a1.2 1.2 0 012.4 0v4c0 2.4-1.6 4.4-4.4 4.4S9 18.9 9 16.5v-1a1.2 1.2 0 012.4 0' stroke='%23f0c040' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 16 16`;

const textSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M8 4h8M12 4v16M8 20h8' stroke='%2339ff14' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 12 12`;

/** Default arrow on canvas / empty space */
export const DEFAULT_CURSOR = `${neonArrow("%23e4e4e7")}, default`;

/** Interactive controls (links, buttons) */
export const NEON_POINTER = `${neonArrow("%2339ff14")}, pointer`;

/** HIT / green target */
export const HIT_CURSOR = `${hitSvg}, crosshair`;

/** SHIT / red face */
export const SHIT_CURSOR = `${shitSvg}, pointer`;

/** Meme drag */
export const GRAB_CURSOR = `${grabSvg}, grab`;
export const GRABBING_CURSOR = `${grabActiveSvg}, grabbing`;

/** Inputs */
export const TEXT_CURSOR = `${textSvg}, text`;

export const DISABLED_CURSOR = "not-allowed";

export function sideCursor(side: "hit" | "shit"): string {
  return side === "hit" ? HIT_CURSOR : SHIT_CURSOR;
}

/** Inline style helpers */
export const cursorStyle = {
  default: { cursor: DEFAULT_CURSOR } as const,
  pointer: { cursor: NEON_POINTER } as const,
  hit: { cursor: HIT_CURSOR } as const,
  shit: { cursor: SHIT_CURSOR } as const,
  grab: { cursor: GRAB_CURSOR } as const,
  grabbing: { cursor: GRABBING_CURSOR } as const,
  text: { cursor: TEXT_CURSOR } as const,
  disabled: { cursor: DISABLED_CURSOR } as const,
};

/**
 * CSS custom properties — inject once (globals) so Tailwind/classes share tokens.
 */
export const CURSOR_CSS_VARS = `
  --cursor-default: ${DEFAULT_CURSOR};
  --cursor-pointer: ${NEON_POINTER};
  --cursor-hit: ${HIT_CURSOR};
  --cursor-shit: ${SHIT_CURSOR};
  --cursor-grab: ${GRAB_CURSOR};
  --cursor-grabbing: ${GRABBING_CURSOR};
  --cursor-text: ${TEXT_CURSOR};
  --cursor-disabled: ${DISABLED_CURSOR};
`.trim();
