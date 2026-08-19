import { type NextRequest } from "next/server";
import { renderLoveOg } from "@/lib/love-og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  const img = await renderLoveOg(ref);
  const headers = new Headers(img.headers);
  headers.set(
    "Cache-Control",
    "public, max-age=300, s-maxage=600, stale-while-revalidate=3600"
  );
  headers.set("Content-Type", "image/png");
  return new Response(img.body, { status: 200, headers });
}
