import { getXProfileMetrics } from "@/lib/x-profile";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const force =
    new URL(request.url).searchParams.get("refresh") === "1";
  try {
    const data = await getXProfileMetrics({ force });
    // Badge data changes slowly — long CDN cache unless force refresh
    const maxAge = force ? 60 : 300;
    return Response.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=1800, max-age=60`,
        "CDN-Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=1800`,
      },
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
