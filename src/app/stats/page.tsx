import { tursoExecute } from "@/lib/turso";
import { resolveAssetMeta } from "@/lib/resolveMeta";
import Link from "next/link";
import type { Metadata } from "next";
import StatsCategoryGrid from "@/components/StatsCategoryGrid";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Statistics · TOKENSHIT",
  description: "Votes, visitors, leaderboards — the numbers behind the shit.",
};

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
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  const display =
    typeof value === "number" ? value.toLocaleString() : String(value);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-3xl font-black font-mono text-foreground">
        {display}
      </div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
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
      <span className="text-lg font-bold text-zinc-600 w-6 text-center font-mono">
        {i + 1}
      </span>
      {t.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={t.logo}
          alt=""
          className="h-8 w-8 rounded-full bg-zinc-800 shrink-0 object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-zinc-800 shrink-0 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
          {(t.symbol || t.name || "?").slice(0, 2)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground text-sm truncate">
          {t.name || t.assetId}
        </div>
        {t.symbol ? (
          <div className="text-xs text-zinc-500 font-mono uppercase">
            {t.symbol}
          </div>
        ) : null}
      </div>
      <div className={`font-mono font-bold ${color}`}>
        {t.count}
        <span className="text-xs text-zinc-500 ml-1">{unit}</span>
      </div>
    </Link>
  );
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-white">
          📊 Statistics
        </h1>
        <p className="text-zinc-400">The numbers behind the shit.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <StatCard label="Total Votes" value={stats.totalVotes} />
        <StatCard label="Unique Visitors" value={stats.uniqueDevices} />
        <StatCard label="Votes Today" value={stats.todayVotes} />
        <StatCard label="Visitors Today" value={stats.todayDevices} />
      </div>

      <StatsCategoryGrid />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-green-500/5">
            <h3 className="font-bold text-green-400">🔥 All-Time Most Hit</h3>
          </div>
          <div className="divide-y divide-border">
            {stats.topHit.length === 0 && (
              <div className="px-4 py-6 text-center text-zinc-500">
                No votes yet
              </div>
            )}
            {stats.topHit.map((t, i) => (
              <LeaderRow key={t.assetId} t={t} i={i} tone="hit" />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-red-500/5">
            <h3 className="font-bold text-red-400">💩 All-Time Most Shit</h3>
          </div>
          <div className="divide-y divide-border">
            {stats.topShit.length === 0 && (
              <div className="px-4 py-6 text-center text-zinc-500">
                No votes yet
              </div>
            )}
            {stats.topShit.map((t, i) => (
              <LeaderRow key={t.assetId} t={t} i={i} tone="shit" />
            ))}
          </div>
        </div>
      </div>

      {stats.dailyVotes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Daily Activity</h2>
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className="border-b border-border text-zinc-500 text-xs uppercase">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3">🔥 Hits</th>
                  <th className="text-right px-4 py-3">💩 Shits</th>
                  <th className="text-right px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.dailyVotes.map((d) => (
                  <tr
                    key={d.day}
                    className="hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-zinc-300">
                      {d.day}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-green-400">
                      {d.hits}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-red-400">
                      {d.shits}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      {d.hits + d.shits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
