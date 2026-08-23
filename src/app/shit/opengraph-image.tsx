import { renderHitShitOg } from "@/lib/hit-shit-og";
import { OG_SIZE } from "@/lib/og-brand";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const alt = "SHIT — TOKEN$HIT Play";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image() {
  return renderHitShitOg("shit");
}
