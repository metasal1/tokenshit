import { NextResponse } from "next/server";
import { tursoExecute } from "@/lib/turso";

const API_BASE = "https://api.tokens.xyz/v1";
const API_KEY = process.env.TOKENS_XYZ_API_KEY!;

async function apiFetchRaw(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-api-key": API_KEY },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET() {
  try {
    const lists = ["majors", "lsts", "currencies", "rwas", "stocks", "metals", "etfs"];

    // Fetch all categories + vote stats in parallel
    const [categoryCounts, voteStats] = await Promise.all([
      Promise.all(
        lists.map(async (list) => {
          const data = await apiFetchRaw(`/assets/curated?list=${list}&groupBy=asset`);
          const assets = Array.isArray(data) ? data : data?.assets || data?.results || data?.items || [];
          return { list, count: assets.length };
        })
      ),
      (async () => {
        const [totalVotes, uniqueDevices, todayVotes, todayDevices, topHit, topShit] = await Promise.all([
          tursoExecute("SELECT COUNT(*) FROM votes", []),
          tursoExecute("SELECT COUNT(DISTINCT device_id) FROM votes", []),
          tursoExecute("SELECT COUNT(*) FROM votes WHERE voted_at = date('now')", []),
          tursoExecute("SELECT COUNT(DISTINCT device_id) FROM votes WHERE voted_at = date('now')", []),
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
          topHit: topHit.rows.map((r) => ({ assetId: r[0] as string, count: Number(r[1]) })),
          topShit: topShit.rows.map((r) => ({ assetId: r[0] as string, count: Number(r[1]) })),
        };
      })(),
    ]);

    const totalTokens = categoryCounts.reduce((sum, c) => sum + c.count, 0);

    return NextResponse.json({
      categories: categoryCounts,
      totalTokens,
      votes: voteStats,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
