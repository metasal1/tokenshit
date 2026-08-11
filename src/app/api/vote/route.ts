import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, vote, twitterUsername, deviceId } = body;

    const voterId = twitterUsername || deviceId;

    if (!assetId || !vote || !voterId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (vote !== "hit" && vote !== "shit") {
      return Response.json(
        { error: "Vote must be 'hit' or 'shit'" },
        { status: 400 }
      );
    }

    try {
      await tursoExecute(
        "INSERT INTO votes (asset_id, device_id, vote) VALUES (?, ?, ?)",
        [assetId, voterId, vote]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("UNIQUE constraint") || msg.includes("UNIQUE")) {
        return Response.json(
          { error: "Already voted today" },
          { status: 409 }
        );
      }
      // surface retryable DB pressure
      if (/429|load-shed|503|unavailable/i.test(msg)) {
        return Response.json(
          {
            error: "Database busy — retry",
            retryable: true,
            detail: msg.slice(0, 200),
          },
          { status: 503 }
        );
      }
      throw e;
    }

    let hits = 0;
    let shits = 0;
    try {
      const counts = await tursoExecute(
        "SELECT vote, COUNT(*) as cnt FROM votes WHERE asset_id = ? AND voted_at = date('now') GROUP BY vote",
        [assetId]
      );
      for (const row of counts.rows) {
        if (row[0] === "hit") hits = Number(row[1]);
        if (row[0] === "shit") shits = Number(row[1]);
      }
    } catch {
      // insert succeeded; counts optional
      if (vote === "hit") hits = 1;
      else shits = 1;
    }

    return Response.json({ hits, shits, userVote: vote });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const retryable = /429|load-shed|503|unavailable|fetch failed/i.test(msg);
    return Response.json(
      { error: msg, retryable },
      { status: retryable ? 503 : 500 }
    );
  }
}
