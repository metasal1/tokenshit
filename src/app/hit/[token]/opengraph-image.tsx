import {
  renderHitShitOg,
  resolveTokenForHitShitOg,
} from "@/lib/hit-shit-og";
import { OG_SIZE } from "@/lib/og-brand";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const alt = "HIT — TOKEN$HIT";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 600;

type Props = { params: Promise<{ token: string }> };

export default async function Image({ params }: Props) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw);
  const meta = await resolveTokenForHitShitOg(token);
  return renderHitShitOg("hit", meta);
}
