import { getKolOgPngResponse } from "@/lib/kol-og-cache";

export const runtime = "nodejs";
export const alt = "Do you love Tokenshit?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

type Props = { params: Promise<{ handle: string }> };

export default async function Image({ params }: Props) {
  const { handle } = await params;
  // Return Response (PNG) — Next accepts Response from opengraph-image
  return getKolOgPngResponse(handle);
}
