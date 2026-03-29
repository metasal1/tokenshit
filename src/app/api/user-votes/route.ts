import { type NextRequest } from "next/server";
import { tursoExecute } from "@/lib/turso";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  if (!username) {
    return Response.json({ error: "Missing username" }, { status: 400 });
  }

  try {
    const result = await tursoExecute(
      "SELECT asset_id, vote, voted_at FROM votes WHERE device_id = ? ORDER BY voted_at DESC LIMIT 50",
      [username]
    );

    const votes = result.rows.map((row) => ({
      assetId: row[0],
      vote: row[1],
      date: row[2],
    }));

    const totalResult = await tursoExecute(
      "SELECT COUNT(*) FROM votes WHERE device_id = ?",
      [username]
    );

    const total = Number(totalResult.rows[0]?.[0] || 0);

    return Response.json({ votes, total });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
