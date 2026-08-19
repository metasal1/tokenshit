import { type NextRequest } from "next/server";
import { renderKolLoveOg } from "@/lib/kol-og";
import { normalizeKolHandle } from "@/lib/kol-noms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ handle: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { handle: raw } = await ctx.params;
  const handle = normalizeKolHandle(raw);
  if (!handle) {
    return new Response("bad handle", { status: 400 });
  }
  const img = await renderKolLoveOg(handle);
  // ImageResponse is a Response subclass
  const headers = new Headers(img.headers);
  headers.set(
    "Cache-Control",
    "public, max-age=120, s-maxage=300, stale-while-revalidate=600"
  );
  headers.set("Content-Type", "image/png");
  return new Response(img.body, { status: 200, headers });
}
