import type { Metadata } from "next";
import Link from "next/link";
import {
  formatHourLabel,
  previousUtcHour,
  utcHourString,
  getRound,
} from "@/lib/day-game";
import { tursoExecute } from "@/lib/turso";
import { vrfExplorerLinks, type VrfRecord } from "@/lib/day-vrf-links";
import { PLAY_PRODUCT } from "@/lib/hour-product";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ date: string }> };

function resolveKey(raw: string): string {
  if (raw === "yesterday" || raw === "prev" || raw === "last") {
    return previousUtcHour(utcHourString());
  }
  if (raw === "today" || raw === "now") return utcHourString();
  return decodeURIComponent(raw);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const key = resolveKey(date);
  return {
    title: `${PLAY_PRODUCT.name} · ${key}`,
    description: `Receipt for ${formatHourLabel(key)}`,
  };
}

function VrfSection({ vrf, label }: { vrf: VrfRecord | null; label: string }) {
  if (!vrf || vrf.error) return null;
  const links = vrfExplorerLinks(vrf);
  if (!links.length && !vrf.blockhash) return null;
  return (
    <div className="pt-2 border-t border-white/10 space-y-1">
      <div className="text-[10px] uppercase text-zinc-500 font-orbitron tracking-wider">
        {label} VRF
        {vrf.provider ? (
          <span className="normal-case text-zinc-600"> · {vrf.provider}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neon-blue hover:underline font-mono"
          >
            {l.label}
            {l.detail ? ` · ${l.detail}` : ""}
          </a>
        ))}
      </div>
      {vrf.blockhash && (
        <div className="text-[10px] font-mono text-zinc-600 break-all">
          bh {vrf.blockhash}
        </div>
      )}
      {vrf.verificationHash && (
        <div className="text-[10px] font-mono text-zinc-600 break-all">
          verify {vrf.verificationHash}
        </div>
      )}
    </div>
  );
}

export default async function PlayReceiptPage({ params }: Props) {
  const { date: raw } = await params;
  const day = resolveKey(raw);

  const round = await getRound(day);
  let hitMeta: { name: string; symbol: string } | null = null;
  let shitMeta: { name: string; symbol: string } | null = null;
  if (round?.hitAssetId) {
    const r = await tursoExecute(
      `SELECT name, symbol FROM day_prices WHERE utc_day=? AND asset_id=? AND phase='close' LIMIT 1`,
      [day, round.hitAssetId]
    );
    if (r.rows[0])
      hitMeta = {
        name: String(r.rows[0][0] || ""),
        symbol: String(r.rows[0][1] || ""),
      };
  }
  if (round?.shitAssetId) {
    const r = await tursoExecute(
      `SELECT name, symbol FROM day_prices WHERE utc_day=? AND asset_id=? AND phase='close' LIMIT 1`,
      [day, round.shitAssetId]
    );
    if (r.rows[0])
      shitMeta = {
        name: String(r.rows[0][0] || ""),
        symbol: String(r.rows[0][1] || ""),
      };
  }

  let hitVrf: VrfRecord | null = null;
  let shitVrf: VrfRecord | null = null;
  if (round?.meta) {
    try {
      const m = JSON.parse(round.meta);
      hitVrf = m.hitVrf || null;
      shitVrf = m.shitVrf || null;
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-4 pt-6 pb-10 space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-neon">
          {PLAY_PRODUCT.name} · receipt
        </p>
        <h1 className="text-xl font-bold text-white font-orbitron tracking-wide">
          {day}
        </h1>
        <p className="text-xs text-zinc-500">{formatHourLabel(day)}</p>
        <p className="text-xs text-zinc-500">
          Status:{" "}
          <span className="text-zinc-300 font-mono">{round?.status || "—"}</span>
        </p>

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-xl border border-green-900/50 bg-green-950/20 p-3 space-y-1">
            <div className="text-[10px] uppercase text-green-500 font-orbitron tracking-wider">
              HIT bag
            </div>
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
              Winner:{" "}
              {round?.hitWinner ||
                (round?.status === "settled" ? "treasury" : "—")}
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
                payout tx {round.hitSig.slice(0, 12)}…
              </a>
            )}
            <VrfSection vrf={hitVrf} label="HIT" />
          </div>

          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3 space-y-1">
            <div className="text-[10px] uppercase text-red-500 font-orbitron tracking-wider">
              SHIT bag
            </div>
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
              Winner:{" "}
              {round?.shitWinner ||
                (round?.status === "settled" ? "treasury" : "—")}
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
                payout tx {round.shitSig.slice(0, 12)}…
              </a>
            )}
            <VrfSection vrf={shitVrf} label="SHIT" />
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-zinc-600 space-x-2">
        <Link href={PLAY_PRODUCT.path} className="text-neon-blue hover:underline">
          ← Play {PLAY_PRODUCT.name}
        </Link>
        <span>·</span>
        <Link
          href={PLAY_PRODUCT.winnersPath}
          className="text-neon-blue hover:underline"
        >
          Winners
        </Link>
        <span>·</span>
        <Link href="/" className="hover:text-zinc-400">
          Home
        </Link>
      </p>
    </div>
  );
}
