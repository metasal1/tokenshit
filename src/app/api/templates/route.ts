import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM = "https://memes.sol.new/api/templates";

/** Alias of /api/memes/templates for older clients */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const url = new URL(UPSTREAM);
    for (const k of [
      "face",
      "source",
      "q",
      "featured",
      "tag",
      "limit",
      "offset",
    ]) {
      const v = sp.get(k);
      if (v != null && v !== "") url.searchParams.set(k, v);
    }
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "200");

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });
    if (!res.ok) {
      return Response.json(
        { ok: false, error: `upstream ${res.status}` },
        { status: 502 }
      );
    }
    const data = await res.json();
    return Response.json(
      { ...data, proxiedFrom: UPSTREAM },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
