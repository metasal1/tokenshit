import { renderKolLoveOg } from "@/lib/kol-og";

export const runtime = "nodejs";
export const alt = "I love Tokenshit?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ handle: string }> };

export default async function Image({ params }: Props) {
  const { handle } = await params;
  return renderKolLoveOg(handle);
}
