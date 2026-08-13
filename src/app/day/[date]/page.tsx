import type { Metadata } from "next";
import Link from "next/link";
import { previousUtcDay, utcDayString, getRound } from "@/lib/day-game";
import { tursoExecute } from "@/lib/turso";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  return { title: `Day ${date} · Hit/Shit` };
}

export default async function DayReceiptPage({ params }: Props) {
  const { date: raw } = await params;
  const day =
    raw === "yesterday"
      ? previousUtcDay(utcDayString())
      : raw === "today"
        ? utcDayString()
        : raw;

  const round = await getRound(day);
  let hitMeta: { name: string; symbol: string } | null = null;
  let shitMeta: { name: string; symbol: string } | null = null;
  if (round?.hitAssetId) {
    const r = await tursoExecute(
      `SELECT name, symbol FROM day_prices WHERE utc_day=? AND asset_id=? AND phase='close' LIMIT 1`,
      [day, round.hitAssetId]
    );
    if (r.rows[0])
      hitMeta = { name: String(r.rows[0][0] || ""), symbol: String(r.rows[0][1] || "") };
  }
  if (round?.shitAssetId) {
    const r = await tursoExecute(
      `SELECT name, symbol FROM day_prices WHERE utc_day=? AND asset_id=? AND phase='close' LIMIT 1`,
      [day, round.shitAssetId]
    );
    if (r.rows[0])
      shitMeta = { name: String(r.rows[0][0] || ""), symbol: String(r.rows[0][1] || "") };
  }

  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-4 pt-6 pb-10 space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h1 className="text-xl font-bold text-white">Day {day}</h1>
        <p className="text-xs text-zinc-500">
          Status:{" "}
          <span className="text-zinc-300 font-mono">{round?.status || "—"}</span>
        </p>

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-xl border border-green-900/50 bg-green-950/20 p-3 space-y-1">
            <div className="text-[10px] uppercase text-green-500">HIT of the day</div>
            <div className="text-white font-semibold">
              {hitMeta?.symbol || round?.hitAssetId || "—"}{" "}
              {round?.hitPct != null && (
                <span className="text-green-400 font-mono text-sm">
                  {round.hitPct >= 0 ? "+" : ""}
                  {round.hitPct.toFixed(2)}%
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500">{hitMeta?.name}</div>
            <div className="text-xs font-mono text-zinc-400 break-all">
              Winner: {round?.hitWinner || (round?.status === "settled" ? "treasury" : "—")}
            </div>
            <div className="text-xs text-zinc-500">
              Prize {round?.hitPrize?.toLocaleString() ?? "—"} · fee{" "}
              {round?.hitFee?.toLocaleString() ?? "—"}
            </div>
            {round?.hitSig && (
              <a
                className="text-xs text-neon-blue hover:underline break-all"
                href={`https://solscan.io/tx/${round.hitSig}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                tx {round.hitSig.slice(0, 12)}…
              </a>
            )}
          </div>

          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3 space-y-1">
            <div className="text-[10px] uppercase text-red-500">SHIT of the day</div>
            <div className="text-white font-semibold">
              {shitMeta?.symbol || round?.shitAssetId || "—"}{" "}
              {round?.shitPct != null && (
                <span className="text-red-400 font-mono text-sm">
                  {round.shitPct >= 0 ? "+" : ""}
                  {round.shitPct.toFixed(2)}%
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500">{shitMeta?.name}</div>
            <div className="text-xs font-mono text-zinc-400 break-all">
              Winner: {round?.shitWinner || (round?.status === "settled" ? "treasury" : "—")}
            </div>
            <div className="text-xs text-zinc-500">
              Prize {round?.shitPrize?.toLocaleString() ?? "—"} · fee{" "}
              {round?.shitFee?.toLocaleString() ?? "—"}
            </div>
            {round?.shitSig && (
              <a
                className="text-xs text-neon-blue hover:underline break-all"
                href={`https://solscan.io/tx/${round.shitSig}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                tx {round.shitSig.slice(0, 12)}…
              </a>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-zinc-600">
        <Link href="/day" className="text-neon-blue hover:underline">
          ← Today
        </Link>
      </p>
    </div>
  );
}
