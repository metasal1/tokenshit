import { type NextRequest } from "next/server";
import { tursoBatch } from "@/lib/turso";

export async function GET(request: NextRequest) {
  const assetId = request.nextUrl.searchParams.get("assetId");
  const deviceId = request.nextUrl.searchParams.get("deviceId");

  if (!assetId) {
    return Response.json({ error: "Missing assetId" }, { status: 400 });
  }

  try {
    const statements = [
      {
        sql: "SELECT vote, COUNT(*) as cnt FROM votes WHERE asset_id = ? AND voted_at = date('now') GROUP BY vote",
        args: [assetId],
      },
      ...(deviceId
        ? [{
            sql: "SELECT vote FROM votes WHERE asset_id = ? AND device_id = ? AND voted_at = date('now') LIMIT 1",
            args: [assetId, deviceId],
          }]
        : []),
      {
        sql: "SELECT COUNT(*) FROM votes WHERE asset_id = ?",
        args: [assetId],
      },
    ];

    const results = await tursoBatch(statements);

    let hits = 0;
    let shits = 0;
    for (const row of results[0].rows) {
      if (row[0] === "hit") hits = Number(row[1]);
      if (row[0] === "shit") shits = Number(row[1]);
    }

    const userVoteIdx = deviceId ? 1 : -1;
    const totalIdx = deviceId ? 2 : 1;

    const userVote = userVoteIdx >= 0 && results[userVoteIdx]?.rows?.[0]?.[0]
      ? (results[userVoteIdx].rows[0][0] as string)
      : null;

    const totalVotes = Number(results[totalIdx]?.rows?.[0]?.[0] || 0);

    return Response.json({ hits, shits, userVote, totalVotes });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
