import { renderLoveOg } from "@/lib/love-og";

export const runtime = "nodejs";
export const alt = "I LOVE TOKENSHIT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

/** Default OG (no ref) — personal cards use /api/love/og?ref= */
export default async function Image() {
  return renderLoveOg(null);
}
