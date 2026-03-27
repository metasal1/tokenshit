import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, vote, deviceId } = body;

    if (!assetId || !vote || !deviceId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (vote !== "hit" && vote !== "shit") {
      return Response.json({ error: "Vote must be 'hit' or 'shit'" }, { status: 400 });
    }

    // Insert vote (UNIQUE constraint handles duplicates)
    try {
      await tursoExecute(
        "INSERT INTO votes (asset_id, device_id, vote) VALUES (?, ?, ?)",
        [assetId, deviceId, vote]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("UNIQUE constraint")) {
        return Response.json({ error: "Already voted today" }, { status: 409 });
      }
      throw e;
    }

    // Return updated counts for today
    const counts = await tursoExecute(
      "SELECT vote, COUNT(*) as cnt FROM votes WHERE asset_id = ? AND voted_at = date('now') GROUP BY vote",
      [assetId]
    );

    let hits = 0;
    let shits = 0;
    for (const row of counts.rows) {
      if (row[0] === "hit") hits = Number(row[1]);
      if (row[0] === "shit") shits = Number(row[1]);
    }

    return Response.json({ hits, shits, userVote: vote });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
