import { tursoExecute } from "@/lib/turso";
import { resolveAssetMeta } from "@/lib/resolveMeta";
import Link from "next/link";
import type { Metadata } from "next";
import StatsCategoryGrid from "@/components/StatsCategoryGrid";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = pageMeta({
  title: "Statistics",
  description: "Votes, visitors, leaderboards — the numbers behind the shit.",
  path: "/stats",
  og: "stats",
});

type Meta = { name: string; symbol: string; logo?: string };

async function safeTurso(
  sql: string,
  args: (string | number | null)[] = []
): Promise<{ columns: string[]; rows: unknown[][] }> {
  try {
    return await tursoExecute(sql, args);
  } catch (e) {
    console.error("stats turso", e);
    return { columns: [], rows: [] };
  }
}

async function getStats() {
  const [
    totalVotes,
    uniqueDevices,
    todayVotes,
    todayDevices,
    topHit,
    topShit,
    votesByDay,
  ] = await Promise.all([
    safeTurso("SELECT COUNT(*) FROM votes", []),
    safeTurso("SELECT COUNT(DISTINCT device_id) FROM votes", []),
    safeTurso("SELECT COUNT(*) FROM votes WHERE voted_at = date('now')", []),
    safeTurso(
      "SELECT COUNT(DISTINCT device_id) FROM votes WHERE voted_at = date('now')",
      []
    ),
    safeTurso(
      "SELECT asset_id, COUNT(*) as cnt FROM votes WHERE vote = 'hit' GROUP BY asset_id ORDER BY cnt DESC LIMIT 10",
      []
    ),
    safeTurso(
      "SELECT asset_id, COUNT(*) as cnt FROM votes WHERE vote = 'shit' GROUP BY asset_id ORDER BY cnt DESC LIMIT 10",
      []
    ),
    safeTurso(
      "SELECT voted_at, vote, COUNT(*) as cnt FROM votes GROUP BY voted_at, vote ORDER BY voted_at DESC LIMIT 40",
      []
    ),
  ]);

  const allIds = [
    ...new Set([
      ...topHit.rows.map((r) => String(r[0] || "")),
      ...topShit.rows.map((r) => String(r[0] || "")),
    ]),
  ].filter(Boolean);

  const meta: Record<string, Meta> = {};
  await Promise.all(
    allIds.map(async (id) => {
      const empty: Meta = {
        name: id.length > 16 ? `${id.slice(0, 8)}…` : id,
        symbol: "",
        logo: "",
      };
      try {
        meta[id] = await Promise.race([
          resolveAssetMeta(id).then((m) => ({
            name: m.name || empty.name,
            symbol: m.symbol || "",
            logo: m.logo || m.logoCandidates?.[0] || "",
          })),
          new Promise<Meta>((r) => setTimeout(() => r(empty), 1200)),
        ]);
      } catch {
        meta[id] = empty;
      }
    })
  );

  const dailyVotes: Record<string, { hits: number; shits: number }> = {};
  for (const row of votesByDay.rows) {
    const day = String(row[0] || "");
    if (!day) continue;
    if (!dailyVotes[day]) dailyVotes[day] = { hits: 0, shits: 0 };
    if (row[1] === "hit") dailyVotes[day].hits = Number(row[2] || 0);
    if (row[1] === "shit") dailyVotes[day].shits = Number(row[2] || 0);
  }

  return {
    totalVotes: Number(totalVotes.rows[0]?.[0] ?? 0),
    uniqueDevices: Number(uniqueDevices.rows[0]?.[0] ?? 0),
    todayVotes: Number(todayVotes.rows[0]?.[0] ?? 0),
    todayDevices: Number(todayDevices.rows[0]?.[0] ?? 0),
    topHit: topHit.rows.map((r) => {
      const assetId = String(r[0]);
      return {
        assetId,
        count: Number(r[1] || 0),
        ...(meta[assetId] || { name: assetId, symbol: "", logo: "" }),
      };
    }),
    topShit: topShit.rows.map((r) => {
      const assetId = String(r[0]);
      return {
        assetId,
        count: Number(r[1] || 0),
        ...(meta[assetId] || { name: assetId, symbol: "", logo: "" }),
      };
    }),
    dailyVotes: Object.entries(dailyVotes)
      .map(([day, v]) => ({ day, ...v }))
      .sort((a, b) => (a.day < b.day ? 1 : -1)),
  };
}

function StatCard({
  label,
  value,
  sub,
  emoji,
  accent = "neon",
}: {
  label: string;
  value: string | number;
  sub?: string;
  emoji: string;
  accent?: "neon" | "green" | "red" | "amber";
}) {
  const display =
    typeof value === "number" ? value.toLocaleString() : String(value);
  const ring =
    accent === "green"
      ? "border-green-500/25 bg-green-950/20"
      : accent === "red"
        ? "border-red-500/25 bg-red-950/20"
        : accent === "amber"
          ? "border-amber-500/25 bg-amber-950/15"
          : "border-neon/30 bg-neon/5";
  const valCls =
    accent === "green"
      ? "text-green-400"
      : accent === "red"
        ? "text-red-400"
        : accent === "amber"
          ? "text-amber-300"
          : "text-neon";
  return (
    <div
      className={`rounded-2xl border ${ring} p-4 sm:p-5 flex flex-col gap-2 min-h-[7rem]`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-[11px] font-orbitron uppercase tracking-[0.16em] text-zinc-500">
          {label}
        </span>
        <EmojiIcon size={18}>{emoji}</EmojiIcon>
      </div>
      <div
        className={`text-2xl sm:text-3xl font-black font-mono tabular-nums leading-none ${valCls}`}
      >
        {display}
      </div>
      {sub ? (
        <div className="text-[11px] text-zinc-500 font-mono mt-auto">{sub}</div>
      ) : null}
    </div>
  );
}

function LeaderRow({
  t,
  i,
  tone,
}: {
  t: {
    assetId: string;
    count: number;
    name: string;
    symbol: string;
    logo?: string;
  };
  i: number;
  tone: "hit" | "shit";
}) {
  const color = tone === "hit" ? "text-green-400" : "text-red-400";
  const hover =
    tone === "hit" ? "hover:bg-green-500/5" : "hover:bg-red-500/5";
  const unit = tone === "hit" ? "hits" : "shits";
  return (
    <Link
      href={`/token/${encodeURIComponent(t.assetId)}`}
      className={`flex items-center gap-3 px-4 py-3 ${hover} transition-colors`}
    >
      <span className="text-sm font-bold text-zinc-600 w-6 text-center font-mono tabular-nums">
        {i + 1}
      </span>
      {t.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={t.logo}
          alt=""
          className="h-9 w-9 rounded-full bg-zinc-800 shrink-0 object-cover ring-1 ring-border"
        />
      ) : (
        <div className="h-9 w-9 rounded-full bg-zinc-800 shrink-0 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase ring-1 ring-border">
          {(t.symbol || t.name || "?").slice(0, 2)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground text-sm truncate">
          {t.name || t.assetId}
        </div>
        {t.symbol ? (
          <div className="text-[11px] text-zinc-500 font-mono uppercase">
            {t.symbol}
          </div>
        ) : null}
      </div>
      <div className={`font-mono font-bold tabular-nums ${color}`}>
        {t.count.toLocaleString()}
        <span className="text-[10px] text-zinc-500 ml-1 font-normal">
          {unit}
        </span>
      </div>
    </Link>
  );
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <div className="flex flex-col pb-10 md:pb-14 lg:pb-16">
      {/* Hero — match home */}
      <header className="relative border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neon/[0.09] via-neon/[0.03] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />

        <div className="relative mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-6xl px-4 sm:px-5 md:px-6 lg:px-8 pt-5 sm:pt-6 md:pt-8 lg:pt-10 pb-5 sm:pb-6 md:pb-7">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
            <div className="min-w-0 text-center md:text-left">
              <p className="text-[10px] font-orbitron uppercase tracking-[0.22em] text-neon mb-1.5">
                Arena data
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-monoton leading-none text-white">
                <span className="inline-flex items-center gap-2">
                  <EmojiIcon size={36}>📊</EmojiIcon>
                  <span>
                    Stat<span className="neon-text">s</span>
                  </span>
                </span>
              </h1>
              <p className="mt-2 text-sm md:text-[15px] text-zinc-400 max-w-md mx-auto md:mx-0 leading-relaxed">
                The numbers behind the shit — votes, visitors, boards.
              </p>
            </div>

            <nav
              className="flex flex-wrap justify-center md:justify-end gap-2 shrink-0"
              aria-label="Stats shortcuts"
            >
              {(
                [
                  { href: "/play", label: "Play", emoji: "🎯" },
                  { href: "/winners", label: "Winners", emoji: "🏆" },
                  { href: "/#vote", label: "Vote", emoji: "🗳️" },
                  { href: "/whales", label: "Whales", emoji: "🐋" },
                ] as const
              ).map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/80 hover:border-neon/40 hover:bg-card px-3 py-2 text-[11px] font-orbitron uppercase tracking-wider text-zinc-300 transition-colors"
                >
                  <EmojiIcon size={14}>{q.emoji}</EmojiIcon>
                  {q.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl md:max-w-4xl lg:max-w-6xl px-4 sm:px-5 md:px-6 lg:px-8 space-y-6 md:space-y-8 pt-5 sm:pt-6 md:pt-8">
        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total votes"
            value={stats.totalVotes}
            emoji="🗳️"
            accent="neon"
          />
          <StatCard
            label="Unique visitors"
            value={stats.uniqueDevices}
            emoji="👤"
            accent="amber"
          />
          <StatCard
            label="Votes today"
            value={stats.todayVotes}
            emoji="⚡"
            accent="green"
          />
          <StatCard
            label="Visitors today"
            value={stats.todayDevices}
            emoji="📡"
            accent="red"
          />
        </div>

        <StatsCategoryGrid />

        {/* Leaders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
          <section className="rounded-2xl border border-green-500/30 bg-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border bg-green-500/5 shrink-0">
              <div className="flex items-center gap-2">
                <EmojiIcon size={18}>🎯</EmojiIcon>
                <h2 className="text-sm font-bold font-orbitron uppercase tracking-wide text-green-400">
                  All-time most HIT
                </h2>
              </div>
              <Link
                href="/#vote"
                className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-500 hover:text-green-400"
              >
                Vote
              </Link>
            </div>
            <div className="divide-y divide-border flex-1">
              {stats.topHit.length === 0 && (
                <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                  No votes yet
                </div>
              )}
              {stats.topHit.map((t, i) => (
                <LeaderRow key={t.assetId} t={t} i={i} tone="hit" />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-red-500/30 bg-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border bg-red-500/5 shrink-0">
              <div className="flex items-center gap-2">
                <EmojiIcon size={18}>💀</EmojiIcon>
                <h2 className="text-sm font-bold font-orbitron uppercase tracking-wide text-red-400">
                  All-time most SHIT
                </h2>
              </div>
              <Link
                href="/#vote"
                className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-500 hover:text-red-400"
              >
                Vote
              </Link>
            </div>
            <div className="divide-y divide-border flex-1">
              {stats.topShit.length === 0 && (
                <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                  No votes yet
                </div>
              )}
              {stats.topShit.map((t, i) => (
                <LeaderRow key={t.assetId} t={t} i={i} tone="shit" />
              ))}
            </div>
          </section>
        </div>

        {/* Daily */}
        {stats.dailyVotes.length > 0 && (
          <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <EmojiIcon size={18}>📅</EmojiIcon>
                <h2 className="text-sm font-bold font-orbitron uppercase tracking-wide text-zinc-200">
                  Daily activity
                </h2>
              </div>
              <span className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-600">
                UTC days
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[320px]">
                <caption className="sr-only">
                  Daily HIT and SHIT vote counts
                </caption>
                <thead>
                  <tr className="border-b border-border text-zinc-500 text-[10px] font-orbitron uppercase tracking-wider">
                    <th scope="col" className="text-left px-4 py-3 font-medium">
                      Date
                    </th>
                    <th
                      scope="col"
                      className="text-right px-4 py-3 font-medium"
                    >
                      Hits
                    </th>
                    <th
                      scope="col"
                      className="text-right px-4 py-3 font-medium"
                    >
                      Shits
                    </th>
                    <th
                      scope="col"
                      className="text-right px-4 py-3 font-medium"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.dailyVotes.map((d) => (
                    <tr
                      key={d.day}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-zinc-300 tabular-nums">
                        {d.day}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-green-400 tabular-nums">
                        {d.hits.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-red-400 tabular-nums">
                        {d.shits.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-white tabular-nums">
                        {(d.hits + d.shits).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
