"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmojiIcon } from "@/components/EmojiIcon";
import { PlayMatchShell } from "@/components/PlayMatchShell";
import { SHIT_SYMBOL } from "@/lib/shit-token";

type Asset = {
  assetId: string;
  symbol: string;
  name: string;
  logo: string;
  wins: number;
  avgPct: number | null;
  bestPct: number | null;
  worstPct: number | null;
  totalPot: number;
  totalPrize: number;
};

type Bucket = {
  key: string;
  label: string;
  rounds: number;
  hit: Asset | null;
  shit: Asset | null;
  topHit: Asset[];
  topShit: Asset[];
};

type LiveSide = {
  assetId: string;
  symbol: string;
  name: string;
  logo: string;
  pct: number;
  price?: number;
} | null;

type Period = "hour" | "day" | "week";

function fmtPct(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function AssetChip({
  a,
  tone,
  showWins,
}: {
  a: Asset | LiveSide;
  tone: "hit" | "shit";
  showWins?: boolean;
}) {
  if (!a) return <span className="text-zinc-600 text-sm">—</span>;
  const pct =
    "avgPct" in a
      ? a.avgPct
      : "pct" in a
        ? a.pct
        : null;
  const wins = "wins" in a ? a.wins : null;
  return (
    <Link
      href={`/token/${encodeURIComponent(a.assetId)}`}
      className="flex items-center gap-2.5 min-w-0 group"
    >
      {a.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={a.logo}
          alt=""
          className="h-9 w-9 rounded-full bg-zinc-800 object-cover ring-1 ring-border shrink-0"
        />
      ) : (
        <div className="h-9 w-9 rounded-full bg-zinc-800 ring-1 ring-border shrink-0" />
      )}
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-white truncate group-hover:text-neon transition-colors">
            {a.symbol || a.name}
          </span>
          <span
            className={`font-mono text-xs tabular-nums shrink-0 ${
              tone === "hit" ? "text-green-400" : "text-red-400"
            }`}
          >
            {fmtPct(pct)}
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono truncate">
          {showWins && wins != null
            ? `${wins} win${wins === 1 ? "" : "s"}`
            : a.name && a.name !== a.symbol
              ? a.name
              : a.assetId}
        </div>
      </div>
    </Link>
  );
}

function RankList({
  title,
  emoji,
  tone,
  rows,
  period,
}: {
  title: string;
  emoji: string;
  tone: "hit" | "shit";
  rows: Asset[];
  period: Period;
}) {
  const border =
    tone === "hit" ? "border-green-500/30" : "border-red-500/30";
  const head =
    tone === "hit"
      ? "bg-green-500/5 text-green-400"
      : "bg-red-500/5 text-red-400";
  return (
    <section
      className={`rounded-2xl border ${border} bg-card overflow-hidden flex flex-col min-h-0`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 border-b border-border ${head}`}
      >
        <div className="flex items-center gap-2">
          <EmojiIcon size={18}>{emoji}</EmojiIcon>
          <h3 className="text-sm font-bold font-orbitron uppercase tracking-wide">
            {title}
          </h3>
        </div>
        <span className="text-[10px] font-orbitron uppercase tracking-wider opacity-70">
          {period === "hour" ? "by hour" : "by wins"}
        </span>
      </div>
      <div className="divide-y divide-border">
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No settled rounds yet
          </p>
        )}
        {rows.map((a, i) => (
          <div
            key={a.assetId}
            className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900/40 transition-colors"
          >
            <span className="w-6 text-center font-mono text-xs text-zinc-600 tabular-nums">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <AssetChip a={a} tone={tone} showWins={period !== "hour"} />
            </div>
            <div className="text-right shrink-0">
              {period !== "hour" && (
                <div className="text-xs font-mono text-zinc-300 tabular-nums">
                  {a.wins}×
                </div>
              )}
              <div className="text-[10px] font-mono text-zinc-600 tabular-nums">
                {a.totalPot > 0
                  ? `${a.totalPot.toLocaleString()} $${SHIT_SYMBOL}`
                  : "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HitShitBoards() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("period");
  const period: Period =
    q === "day" || q === "week" || q === "hour" ? q : "hour";

  const [buckets, setBuckets] = useState<Bucket[] | null>(null);
  const [overallHit, setOverallHit] = useState<Asset[]>([]);
  const [overallShit, setOverallShit] = useState<Asset[]>([]);
  const [live, setLive] = useState<{
    hour: string;
    hitting: LiveSide;
    shitting: LiveSide;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [rounds, setRounds] = useState(0);

  const setPeriod = useCallback(
    (p: Period) => {
      router.replace(`${pathname || "/boards"}?period=${p}`, { scroll: false });
    },
    [pathname, router]
  );

  useEffect(() => {
    let cancelled = false;
    setBuckets(null);
    setErr(null);
    const limit = period === "hour" ? 48 : period === "day" ? 21 : 12;
    fetch(`/api/boards?period=${period}&limit=${limit}`, {
      cache: "no-store",
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "load failed");
        if (cancelled) return;
        setBuckets(d.buckets || []);
        setOverallHit(d.overallHit || []);
        setOverallShit(d.overallShit || []);
        setLive(d.live || null);
        setRounds(Number(d.roundsScanned || 0));
      })
      .catch((e) => {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <PlayMatchShell
      title={
        <>
          <span className="neon-text">HIT</span>
          <span className="text-zinc-600 mx-1">/</span>
          <span className="text-red-400">SHIT</span>
        </>
      }
      titleAccent="boards"
      links={[
        { href: "/play", label: "Play", primary: true },
        { href: "/memes", label: "Memes" },
        { href: "/referrals", label: "Refer" },
      ]}
    >
      <div className="space-y-4 pb-4">
        <div className="flex flex-col gap-2">
          <div className="inline-flex rounded-xl border border-border overflow-hidden text-[10px] font-orbitron uppercase tracking-wider self-start">
            {(
              [
                ["hour", "Hour"],
                ["day", "Day"],
                ["week", "Week"],
              ] as const
            ).map(([k, lab]) => (
              <button
                key={k}
                type="button"
                onClick={() => setPeriod(k)}
                className={`min-h-9 px-3 transition-colors ${
                  period === k
                    ? "bg-neon text-black font-bold"
                    : "bg-zinc-950 text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {lab}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500">
            Hourly · daily · weekly pot winners
          </p>
        </div>

        {/* Live hour */}
        {live && (live.hitting || live.shitting) && (
          <section className="rounded-2xl border border-neon/35 bg-gradient-to-b from-neon/10 via-card to-card p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon" />
                </span>
                <h2 className="text-xs font-bold font-orbitron uppercase tracking-wide text-neon">
                  Live hour
                </h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {live.hour}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-green-500/25 bg-green-950/25 p-2.5">
                <div className="text-[9px] font-orbitron uppercase tracking-wider text-green-400/90 mb-1.5">
                  HIT
                </div>
                {live.hitting ? (
                  <AssetChip a={live.hitting} tone="hit" />
                ) : (
                  <span className="text-zinc-600 text-sm">—</span>
                )}
              </div>
              <div className="rounded-xl border border-red-500/25 bg-red-950/25 p-2.5">
                <div className="text-[9px] font-orbitron uppercase tracking-wider text-red-400/90 mb-1.5">
                  SHIT
                </div>
                {live.shitting ? (
                  <AssetChip a={live.shitting} tone="shit" />
                ) : (
                  <span className="text-zinc-600 text-sm">—</span>
                )}
              </div>
            </div>
          </section>
        )}

        {err && (
          <p className="text-sm text-red-400 border border-red-900/40 rounded-xl px-3 py-2">
            {err}
          </p>
        )}

        {!buckets && !err && (
          <div className="flex justify-center py-12">
            <EmojiIcon size={28} className="animate-spin opacity-80">
              💫
            </EmojiIcon>
          </div>
        )}

        {buckets && (
          <div className="grid grid-cols-1 gap-3">
            <RankList
              title={
                period === "hour"
                  ? "Top HIT"
                  : period === "day"
                    ? "HIT · daily"
                    : "HIT · weekly"
              }
              emoji="🎯"
              tone="hit"
              rows={overallHit}
              period={period}
            />
            <RankList
              title={
                period === "hour"
                  ? "Top SHIT"
                  : period === "day"
                    ? "SHIT · daily"
                    : "SHIT · weekly"
              }
              emoji="💀"
              tone="shit"
              rows={overallShit}
              period={period}
            />
          </div>
        )}

        {buckets && buckets.length > 0 && (
          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
              <h2 className="text-xs font-bold font-orbitron uppercase tracking-wide text-zinc-200">
                {period === "hour"
                  ? "Each hour"
                  : period === "day"
                    ? "Each UTC day"
                    : "Each ISO week"}
              </h2>
              <span className="text-[10px] font-mono text-zinc-600">
                {rounds} rounds
              </span>
            </div>
            <div className="divide-y divide-border">
              {buckets.map((b) => (
                <div
                  key={b.key}
                  className="grid grid-cols-1 gap-2.5 px-3.5 py-3 hover:bg-zinc-950/50 transition-colors"
                >
                  <div className="min-w-0 flex items-baseline justify-between gap-2">
                    <div className="text-xs font-mono text-zinc-300 tabular-nums">
                      {b.label}
                    </div>
                    <div className="text-[10px] text-zinc-600 font-orbitron uppercase tracking-wider">
                      {b.rounds}r
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="min-w-0">
                      <div className="text-[9px] font-orbitron uppercase tracking-wider text-green-500/80 mb-1">
                        HIT
                      </div>
                      {b.hit ? (
                        <AssetChip
                          a={b.hit}
                          tone="hit"
                          showWins={period !== "hour"}
                        />
                      ) : (
                        <span className="text-zinc-600 text-sm">—</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-orbitron uppercase tracking-wider text-red-500/80 mb-1">
                        SHIT
                      </div>
                      {b.shit ? (
                        <AssetChip
                          a={b.shit}
                          tone="shit"
                          showWins={period !== "hour"}
                        />
                      ) : (
                        <span className="text-zinc-600 text-sm">—</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {buckets && buckets.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-zinc-500">
            No settled hours yet.{" "}
            <Link href="/play" className="text-neon-blue hover:underline">
              Play this round
            </Link>
            .
          </div>
        )}
      </div>
    </PlayMatchShell>
  );
}
