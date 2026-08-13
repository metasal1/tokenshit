import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ALLOW = new Set([
  "memes.sal.fun",
  "api.memegen.link",
  "i.imgflip.com",
  "imgflip.com",
]);

/**
 * GET /api/memes/blank?url= — CORS-safe blank proxy for canvas export
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url") || "";
  if (!raw) {
    return Response.json({ error: "url required" }, { status: 400 });
  }
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return Response.json({ error: "bad url" }, { status: 400 });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return Response.json({ error: "bad protocol" }, { status: 400 });
  }
  const host = parsed.hostname.toLowerCase();
  const ok =
    ALLOW.has(host) ||
    host.endsWith(".sal.fun") ||
    host.endsWith(".imgflip.com") ||
    host.endsWith(".memegen.link");
  if (!ok) {
    return Response.json({ error: "host not allowed" }, { status: 403 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: { Accept: "image/*,*/*" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return new Response(`upstream ${res.status}`, { status: 502 });
    }
    const buf = await res.arrayBuffer();
    const ct = res.headers.get("content-type") || "image/jpeg";
    return new Response(buf, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
