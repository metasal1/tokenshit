import { apiFetch } from "@/lib/api";
import { tursoExecute } from "@/lib/turso";
import Link from "next/link";

export const revalidate = 60;

const LISTS = [
  { key: "majors", label: "Majors", emoji: "🏆" },
  { key: "lsts", label: "LSTs", emoji: "💧" },
  { key: "currencies", label: "Currencies", emoji: "💵" },
  { key: "rwas", label: "RWAs", emoji: "🏠" },
  { key: "stocks", label: "Stocks", emoji: "📈" },
  { key: "metals", label: "Metals", emoji: "🪙" },
  { key: "etfs", label: "ETFs", emoji: "📊" },
];

async function getStats() {
  const [categoryCounts, totalVotes, uniqueDevices, todayVotes, todayDevices, topHit, topShit, votesByDay] =
    await Promise.all([
      Promise.all(
        LISTS.map(async (l) => {
          try {
            const data = await apiFetch(`/assets/curated?list=${l.key}&groupBy=asset`);
            const assets = Array.isArray(data) ? data : data?.assets || data?.results || data?.items || [];
            return { ...l, count: assets.length };
          } catch {
            return { ...l, count: 0 };
          }
        })
      ),
      tursoExecute("SELECT COUNT(*) FROM votes", []),
      tursoExecute("SELECT COUNT(DISTINCT device_id) FROM votes", []),
      tursoExecute("SELECT COUNT(*) FROM votes WHERE voted_at = date('now')", []),
      tursoExecute("SELECT COUNT(DISTINCT device_id) FROM votes WHERE voted_at = date('now')", []),
      tursoExecute(
        "SELECT asset_id, COUNT(*) as cnt FROM votes WHERE vote = 'hit' GROUP BY asset_id ORDER BY cnt DESC LIMIT 10",
        []
      ),
      tursoExecute(
        "SELECT asset_id, COUNT(*) as cnt FROM votes WHERE vote = 'shit' GROUP BY asset_id ORDER BY cnt DESC LIMIT 10",
        []
      ),
      tursoExecute(
        "SELECT voted_at, vote, COUNT(*) as cnt FROM votes GROUP BY voted_at, vote ORDER BY voted_at DESC LIMIT 30",
        []
      ),
    ]);

  // Resolve top asset names
  const allIds = [...new Set([
    ...topHit.rows.map((r) => r[0] as string),
    ...topShit.rows.map((r) => r[0] as string),
  ])];

  const meta: Record<string, { name: string; symbol: string }> = {};
  await Promise.all(
    allIds.map(async (id) => {
      try {
        const d = await apiFetch(`/assets/${encodeURIComponent(id)}`);
        const a = d.asset || d;
        meta[id] = { name: a.name || id, symbol: a.symbol || "" };
      } catch {
        meta[id] = { name: id, symbol: "" };
      }
    })
  );

  // Group votes by day
  const dailyVotes: Record<string, { hits: number; shits: number }> = {};
  for (const row of votesByDay.rows) {
    const day = row[0] as string;
    if (!dailyVotes[day]) dailyVotes[day] = { hits: 0, shits: 0 };
    if (row[1] === "hit") dailyVotes[day].hits = Number(row[2]);
    if (row[1] === "shit") dailyVotes[day].shits = Number(row[2]);
  }

  return {
    categories: categoryCounts,
    totalTokens: categoryCounts.reduce((s, c) => s + c.count, 0),
    totalVotes: Number(totalVotes.rows[0]?.[0] ?? 0),
    uniqueDevices: Number(uniqueDevices.rows[0]?.[0] ?? 0),
    todayVotes: Number(todayVotes.rows[0]?.[0] ?? 0),
    todayDevices: Number(todayDevices.rows[0]?.[0] ?? 0),
    topHit: topHit.rows.map((r) => ({
      assetId: r[0] as string,
      count: Number(r[1]),
      ...meta[r[0] as string],
    })),
    topShit: topShit.rows.map((r) => ({
      assetId: r[0] as string,
      count: Number(r[1]),
      ...meta[r[0] as string],
    })),
    dailyVotes: Object.entries(dailyVotes).map(([day, v]) => ({ day, ...v })),
  };
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-3xl font-black font-mono text-foreground">{value.toLocaleString()}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </div>
  );
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2">
          📊 Statistics
        </h1>
        <p className="text-zinc-400">The numbers behind the shit.</p>
      </div>

      {/* Vote Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Votes" value={stats.totalVotes} />
        <StatCard label="Unique Visitors" value={stats.uniqueDevices} />
        <StatCard label="Votes Today" value={stats.todayVotes} />
        <StatCard label="Visitors Today" value={stats.todayDevices} />
      </div>

      {/* Token Categories */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Tokens by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {stats.categories.map((c) => (
            <div
              key={c.key}
              className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
            >
              <span className="text-2xl">{c.emoji}</span>
              <div>
                <div className="font-semibold text-foreground">{c.label}</div>
                <div className="text-sm font-mono text-zinc-400">{c.count} tokens</div>
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-neon/30 bg-neon/5 p-4 flex items-center gap-3">
            <span className="text-2xl">🧮</span>
            <div>
              <div className="font-semibold text-neon">Total</div>
              <div className="text-sm font-mono text-zinc-400">{stats.totalTokens} tokens</div>
            </div>
          </div>
        </div>
      </div>

      {/* All-Time Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-green-500/5">
            <h3 className="font-bold text-green-400">🔥 All-Time Most Hit</h3>
          </div>
          <div className="divide-y divide-border">
            {stats.topHit.length === 0 && (
              <div className="px-4 py-6 text-center text-zinc-500">No votes yet</div>
            )}
            {stats.topHit.map((t, i) => (
              <Link
                key={t.assetId}
                href={`/token/${encodeURIComponent(t.assetId)}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-green-500/5 transition-colors"
              >
                <span className="text-lg font-bold text-zinc-600 w-6 text-center font-mono">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">
                    {t.name}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono uppercase">{t.symbol}</div>
                </div>
                <div className="font-mono font-bold text-green-400">
                  {t.count}
                  <span className="text-xs text-zinc-500 ml-1">hits</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-red-500/5">
            <h3 className="font-bold text-red-400">💩 All-Time Most Shit</h3>
          </div>
          <div className="divide-y divide-border">
            {stats.topShit.length === 0 && (
              <div className="px-4 py-6 text-center text-zinc-500">No votes yet</div>
            )}
            {stats.topShit.map((t, i) => (
              <Link
                key={t.assetId}
                href={`/token/${encodeURIComponent(t.assetId)}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/5 transition-colors"
              >
                <span className="text-lg font-bold text-zinc-600 w-6 text-center font-mono">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">
                    {t.name}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono uppercase">{t.symbol}</div>
                </div>
                <div className="font-mono font-bold text-red-400">
                  {t.count}
                  <span className="text-xs text-zinc-500 ml-1">shits</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Activity */}
      {stats.dailyVotes.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Daily Activity</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
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
                  <tr key={d.day} className="hover:bg-card-hover transition-colors">
                    <td className="px-4 py-3 font-mono">{d.day}</td>
                    <td className="px-4 py-3 text-right font-mono text-green-400">{d.hits}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-400">{d.shits}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">{d.hits + d.shits}</td>
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
