import { getLeaderboardData } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const withCategories = url.searchParams.get("withCategories") !== "0";
  const limit = Math.min(
    40,
    Math.max(5, Number(url.searchParams.get("limit") || 15) || 15)
  );

  try {
    const data = await getLeaderboardData({
      limit,
      withCategories,
      withMeta: true,
    });

    return Response.json(data, {
      headers: {
        // Browser + CF edge cache — big win for repeat hits
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=300, max-age=30",
        "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
