import { tursoExecute } from "@/lib/turso";
import {
  GLOBAL_TREASURY_DAILY_DROP,
  nextUtcMidnight,
} from "@/lib/shit-token";

export async function ensureTreasuryDropSchema() {
  await tursoExecute(
    `CREATE TABLE IF NOT EXISTS treasury_drops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      signature TEXT,
      note TEXT,
      dropped_at TEXT DEFAULT (datetime('now')),
      utc_day TEXT NOT NULL,
      UNIQUE(utc_day)
    )`,
    []
  );
}

function utcDayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function getLastDrop(): Promise<{
  amount: number;
  signature: string | null;
  droppedAt: string | null;
  utcDay: string | null;
} | null> {
  try {
    await ensureTreasuryDropSchema();
    const r = await tursoExecute(
      `SELECT amount, signature, dropped_at, utc_day
       FROM treasury_drops
       ORDER BY id DESC LIMIT 1`,
      []
    );
    if (!r.rows.length) return null;
    const row = r.rows[0];
    return {
      amount: Number(row[0]),
      signature: row[1] != null ? String(row[1]) : null,
      droppedAt: row[2] != null ? String(row[2]) : null,
      utcDay: row[3] != null ? String(row[3]) : null,
    };
  } catch {
    return null;
  }
}

export async function hasDroppedToday(now: Date = new Date()): Promise<boolean> {
  try {
    await ensureTreasuryDropSchema();
    const day = utcDayKey(now);
    const r = await tursoExecute(
      `SELECT 1 FROM treasury_drops WHERE utc_day = ? LIMIT 1`,
      [day]
    );
    return r.rows.length > 0;
  } catch {
    return false;
  }
}

export async function recordDrop(opts: {
  amount: number;
  signature?: string | null;
  note?: string | null;
  at?: Date;
}): Promise<{ utcDay: string }> {
  await ensureTreasuryDropSchema();
  const at = opts.at || new Date();
  const utcDay = utcDayKey(at);
  await tursoExecute(
    `INSERT INTO treasury_drops (amount, signature, note, utc_day, dropped_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(utc_day) DO UPDATE SET
       amount = excluded.amount,
       signature = COALESCE(excluded.signature, treasury_drops.signature),
       note = COALESCE(excluded.note, treasury_drops.note),
       dropped_at = datetime('now')`,
    [
      opts.amount,
      opts.signature || null,
      opts.note || null,
      utcDay,
    ]
  );
  return { utcDay };
}

export function buildDropSchedule(now: Date = new Date()) {
  const next = nextUtcMidnight(now);
  return {
    nextDropAt: next.toISOString(),
    nextDropAtMs: next.getTime(),
    msRemaining: Math.max(0, next.getTime() - now.getTime()),
    dropAmount: GLOBAL_TREASURY_DAILY_DROP,
    cron: "0 0 * * *", // UTC
    timezone: "UTC",
  };
}
