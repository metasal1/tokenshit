import { getLoveOgPngResponse } from "@/lib/love-og-cache";

export const runtime = "nodejs";
export const alt = "I LOVE TOKENSHIT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image() {
  return getLoveOgPngResponse(null);
}
