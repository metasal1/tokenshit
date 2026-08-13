import { NextResponse } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { getPool } from "@/lib/random-pool";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lists = [
      "majors",
      "lsts",
      "currencies",
      "rwas",
      "stocks",
      "metals",
      "etfs",
    ];

    const [categoryCounts, pool, voteStats] = await Promise.all([
      Promise.all(
        lists.map(async (list) => {
          try {
            const { fetchCuratedList } = await import("@/lib/curatedAssets");
            const assets = await fetchCuratedList(list);
            return { list, count: assets.length };
          } catch {
            return { list, count: 0 };
          }
        })
      ),
      getPool(),
      (async () => {
        const [
          totalVotes,
          uniqueDevices,
          todayVotes,
          todayDevices,
          topHit,
          topShit,
        ] = await Promise.all([
          tursoExecute("SELECT COUNT(*) FROM votes", []),
          tursoExecute("SELECT COUNT(DISTINCT device_id) FROM votes", []),
          tursoExecute(
            "SELECT COUNT(*) FROM votes WHERE voted_at = date('now')",
            []
          ),
          tursoExecute(
            "SELECT COUNT(DISTINCT device_id) FROM votes WHERE voted_at = date('now')",
            []
          ),
          tursoExecute(
            "SELECT asset_id, COUNT(*) as cnt FROM votes WHERE vote = 'hit' GROUP BY asset_id ORDER BY cnt DESC LIMIT 5",
            []
          ),
          tursoExecute(
            "SELECT asset_id, COUNT(*) as cnt FROM votes WHERE vote = 'shit' GROUP BY asset_id ORDER BY cnt DESC LIMIT 5",
            []
          ),
        ]);

        return {
          totalVotes: Number(totalVotes.rows[0]?.[0] ?? 0),
          uniqueDevices: Number(uniqueDevices.rows[0]?.[0] ?? 0),
          todayVotes: Number(todayVotes.rows[0]?.[0] ?? 0),
          todayDevices: Number(todayDevices.rows[0]?.[0] ?? 0),
          topHit: topHit.rows.map((r) => ({
            assetId: r[0] as string,
            count: Number(r[1]),
          })),
          topShit: topShit.rows.map((r) => ({
            assetId: r[0] as string,
            count: Number(r[1]),
          })),
        };
      })(),
    ]);

    const summedLists = categoryCounts.reduce((sum, c) => sum + c.count, 0);
    const totalTokens = pool.length; // unique assetIds — same as vote arena

    return NextResponse.json({
      categories: categoryCounts,
      totalTokens,
      uniqueTokens: totalTokens,
      summedLists,
      votes: voteStats,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
