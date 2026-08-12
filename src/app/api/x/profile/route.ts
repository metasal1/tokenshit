import { getXProfileMetrics } from "@/lib/x-profile";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const force =
    new URL(request.url).searchParams.get("refresh") === "1";
  try {
    const data = await getXProfileMetrics({ force });
    const maxAge = data.source === "live" ? 120 : 30;
    return Response.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=600, max-age=30`,
        "CDN-Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=600`,
      },
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
