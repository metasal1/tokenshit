import { NextRequest, NextResponse } from "next/server";
import { tursoExecute } from "@/lib/turso";

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json();
    if (!deviceId) return NextResponse.json({ error: "missing deviceId" }, { status: 400 });

    const now = Math.floor(Date.now() / 1000);
    // Upsert visitor
    await tursoExecute(
      "INSERT INTO active_visitors (device_id, last_seen) VALUES (?, ?) ON CONFLICT(device_id) DO UPDATE SET last_seen = ?",
      [deviceId, now, now]
    );
    // Clean stale (>60s) and count active
    await tursoExecute("DELETE FROM active_visitors WHERE last_seen < ?", [now - 60]);
    const result = await tursoExecute("SELECT COUNT(*) FROM active_visitors", []);
    const count = Number(result.rows[0]?.[0] ?? 0);

    return NextResponse.json({ online: count });
  } catch (e) {
    return NextResponse.json({ online: 0, error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const now = Math.floor(Date.now() / 1000);
    await tursoExecute("DELETE FROM active_visitors WHERE last_seen < ?", [now - 60]);
    const result = await tursoExecute("SELECT COUNT(*) FROM active_visitors", []);
    return NextResponse.json({ online: Number(result.rows[0]?.[0] ?? 0) });
  } catch {
    return NextResponse.json({ online: 0 });
  }
}
