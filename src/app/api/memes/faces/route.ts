import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM = "https://memes.sol.new/api/faces";

/**
 * GET /api/memes/faces — proxy KV-backed face packs from memes.sol.new
 * Used to populate face filter chips (Toly, Elon, Bezos, Jensen, Zuck, …)
 */
export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(UPSTREAM, {
      headers: { Accept: "application/json", "User-Agent": "tokenshit-memes/1.0" },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return Response.json(
        { ok: false, error: `upstream ${res.status}` },
        { status: 502 },
      );
    }
    const data = await res.json();
    return Response.json(
      { ...data, proxiedFrom: UPSTREAM },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
