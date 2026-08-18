import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";
import { requirePrivy } from "@/lib/privy-server";
import { getClientIp, rateLimitIp } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

/**
 * POST /api/vote
 * Body: { assetId, vote, deviceId? }
 * twitterUsername from body is IGNORED unless it matches Privy session X.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimitIp({
      ip: getClientIp(request),
      bucket: "vote",
      limit: 200,
      windowHours: 1,
    });
    if (limited) return limited;

    const body = await request.json();
    const assetId = String(body.assetId || "").trim();
    const vote = body.vote;
    const deviceId = body.deviceId ? String(body.deviceId).trim().slice(0, 128) : "";

    // Only use twitter if authenticated session matches
    let twitterFromSession: string | null = null;
    const auth = await requirePrivy(request, {});
    if (auth.ok && auth.id.twitter) {
      twitterFromSession = String(auth.id.twitter)
        .toLowerCase()
        .replace(/^@/, "");
    }

    const voterId = twitterFromSession || deviceId;

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

    if (assetId.length > 128 || !/^[a-zA-Z0-9_.:-]+$/.test(assetId)) {
      return Response.json({ error: "Invalid asset" }, { status: 400 });
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
      if (/429|load-shed|503|unavailable/i.test(msg)) {
        return Response.json(
          { error: "Database busy — retry", retryable: true },
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
      if (vote === "hit") hits = 1;
      else shits = 1;
    }

    return Response.json({ hits, shits, userVote: vote });
  } catch {
    return Response.json(
      { error: "Vote failed", retryable: true },
      { status: 500 }
    );
  }
}
