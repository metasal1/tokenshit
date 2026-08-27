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
import { hourSettleTweet } from "@/lib/token-x-copy";
import { getAssetX } from "@/lib/token-x";
import { XLogo } from "@/components/XLogo";

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
  if (!vrf) {
    return (
      <div className="pt-2 border-t border-white/10">
        <p className="text-[11px] text-zinc-600">No VRF for this side (empty / no draw)</p>
      </div>
    );
  }
  if (vrf.error) {
    return (
      <div className="pt-2 border-t border-white/10">
        <p className="text-[11px] text-amber-500/90">VRF / payout note: {vrf.error}</p>
      </div>
    );
  }
  const links = vrfExplorerLinks(vrf);
  const primary = links[0];
  return (
    <div className="pt-2 border-t border-white/10 space-y-2">
      <div className="text-[10px] uppercase text-zinc-500 font-orbitron tracking-wider">
        {label} VRF proof
        {vrf.provider ? (
          <span className="normal-case text-zinc-600"> · {vrf.provider}</span>
        ) : null}
      </div>
      {primary && (
        <a
          href={primary.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 min-h-10 w-full rounded-xl border border-neon-blue/40 bg-neon-blue/10 text-neon-blue text-sm font-mono font-semibold hover:bg-neon-blue/20"
        >
          🎲 Open VRF · {primary.label}
          {primary.detail ? ` ${primary.detail}` : ""}
        </a>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {links.slice(1).map((l) => (
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
      {vrf.entriesHash && (
        <div className="text-[10px] font-mono text-zinc-600 break-all">
          entries {vrf.entriesHash}
        </div>
      )}
      {vrf.ticketCount != null && (
        <div className="text-[10px] text-zinc-500">
          tickets {vrf.ticketCount}
          {vrf.winnerIndex != null ? ` · index ${vrf.winnerIndex}` : ""}
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

  const hitX = round?.hitAssetId
    ? await getAssetX(round.hitAssetId, hitMeta?.symbol)
    : "";
  const shitX = round?.shitAssetId
    ? await getAssetX(round.shitAssetId, shitMeta?.symbol)
    : "";
  const receiptUrl = `https://tokenshit.com/play/${encodeURIComponent(day)}`;
  const tweetText =
    round?.status === "settled"
      ? `${hourSettleTweet({
          hit: {
            symbol: hitMeta?.symbol || round.hitAssetId || "",
            handle: hitX,
            pct: round.hitPct ?? null,
            winner: round.hitWinner || null,
            prize: round.hitPrize ?? null,
          },
          shit: {
            symbol: shitMeta?.symbol || round.shitAssetId || "",
            handle: shitX,
            pct: round.shitPct ?? null,
            winner: round.shitWinner || null,
            prize: round.shitPrize ?? null,
          },
        })}\n${receiptUrl}`
      : `${PLAY_PRODUCT.tweetName} · ${formatHourLabel(day)}\n\nPlay this hour. FREE. 1 UP + 1 DOWN. Top 3 win.\n\n${receiptUrl}`;

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

        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-11 rounded-xl bg-neon text-black font-bold text-sm inline-flex items-center justify-center gap-2 hover:brightness-110"
        >
          <XLogo size={15} className="text-black" />
          Share to X
        </a>
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
