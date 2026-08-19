import { tursoExecute } from "@/lib/turso";
import { resolveAssetMeta } from "@/lib/resolveMeta";
import Link from "next/link";
import type { Metadata } from "next";
import StatsCategoryGrid from "@/components/StatsCategoryGrid";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";
import ShareRefButton from "@/components/ShareRefButton";
import { REFERRAL_REWARD_SHIT } from "@/lib/shit-token";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = pageMeta({
  title: "Statistics",
  description: "Votes, visitors, share/referral network, leaderboards — the numbers behind the shit.",
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
    totalRefs,
    uniqueSharers,
    todayRefs,
    paidRewards,
    paidAmount,
    topSharers,
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
    // Share / referral network
    safeTurso("SELECT COUNT(*) FROM referrals", []),
    safeTurso(
      "SELECT COUNT(DISTINCT lower(referrer_twitter)) FROM referrals",
      []
    ),
    safeTurso(
      "SELECT COUNT(*) FROM referrals WHERE date(created_at) = date('now')",
      []
    ),
    safeTurso(
      `SELECT COUNT(*) FROM referral_rewards
       WHERE signature IS NOT NULL AND signature != '' AND signature != 'pending'`,
      []
    ),
    safeTurso(
      `SELECT COALESCE(SUM(amount), 0) FROM referral_rewards
       WHERE signature IS NOT NULL AND signature != '' AND signature != 'pending'`,
      []
    ),
    safeTurso(
      `SELECT lower(referrer_twitter) AS h, COUNT(*) AS c
       FROM referrals
       WHERE referrer_twitter IS NOT NULL AND trim(referrer_twitter) != ''
       GROUP BY lower(referrer_twitter)
       ORDER BY c DESC
       LIMIT 15`,
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
    share: {
      totalRefs: Number(totalRefs.rows[0]?.[0] ?? 0),
      uniqueSharers: Number(uniqueSharers.rows[0]?.[0] ?? 0),
      todayRefs: Number(todayRefs.rows[0]?.[0] ?? 0),
      paidRewards: Number(paidRewards.rows[0]?.[0] ?? 0),
      paidAmount: Number(paidAmount.rows[0]?.[0] ?? 0),
      topSharers: topSharers.rows.map((r) => ({
        handle: String(r[0] || "").replace(/^@/, ""),
        count: Number(r[1] || 0),
      })).filter((x) => x.handle),
    },
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
                Votes, visitors, shares & referrals — the numbers behind the shit.
              </p>
            </div>

            <nav
              className="flex flex-wrap justify-center md:justify-end gap-2 shrink-0"
              aria-label="Stats shortcuts"
            >
              {(
                [
                  { href: "/play", label: "Play", emoji: "🎯" },
                  { href: "/referrals", label: "Share", emoji: "🔗" },
                  { href: "/winners", label: "Winners", emoji: "🏆" },
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

        {/* Share / referral network */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-neon mb-1">
                Growth loop
              </p>
              <h2 className="text-lg sm:text-xl font-bold font-orbitron uppercase tracking-wide text-white flex items-center gap-2">
                <EmojiIcon size={22}>🔗</EmojiIcon>
                Share stats
              </h2>
              <p className="mt-1 text-xs text-zinc-500 max-w-lg">
                Ref links tracked on signup ·{" "}
                {REFERRAL_REWARD_SHIT.toLocaleString()} $TOKENSHIT per qualified
                paid referral
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/referrals"
                className="rounded-xl border border-neon/40 bg-neon/10 px-3 py-2 text-[11px] font-orbitron uppercase tracking-wider text-neon hover:bg-neon/15"
              >
                Open referrals
              </Link>
              <ShareRefButton path="/" variant="compact" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard
              label="Total shares"
              value={stats.share.totalRefs}
              sub="ref signups tracked"
              emoji="🔗"
              accent="neon"
            />
            <StatCard
              label="Sharers"
              value={stats.share.uniqueSharers}
              sub="unique X accounts"
              emoji="📣"
              accent="amber"
            />
            <StatCard
              label="Shares today"
              value={stats.share.todayRefs}
              sub="UTC day"
              emoji="⚡"
              accent="green"
            />
            <StatCard
              label="Paid outs"
              value={stats.share.paidRewards}
              sub="referral claims settled"
              emoji="💸"
              accent="amber"
            />
            <StatCard
              label="Paid $TOKENSHIT"
              value={Math.round(stats.share.paidAmount).toLocaleString()}
              sub="sum of referral rewards"
              emoji="💰"
              accent="neon"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <section className="rounded-2xl border border-neon/30 bg-card overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border bg-neon/5 shrink-0">
                <div className="flex items-center gap-2">
                  <EmojiIcon size={18}>🏆</EmojiIcon>
                  <h3 className="text-sm font-bold font-orbitron uppercase tracking-wide text-neon">
                    Top sharers
                  </h3>
                </div>
                <span className="text-[10px] font-orbitron uppercase tracking-wider text-zinc-600">
                  by refs
                </span>
              </div>
              <div className="divide-y divide-border flex-1">
                {stats.share.topSharers.length === 0 ? (
                  <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                    No referrals yet — share your link
                  </div>
                ) : (
                  stats.share.topSharers.map((s, i) => (
                    <div
                      key={s.handle}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-neon/5 transition-colors"
                    >
                      <span className="text-sm font-bold text-zinc-600 w-6 text-center font-mono tabular-nums">
                        {i + 1}
                      </span>
                      <a
                        href={`https://x.com/${encodeURIComponent(s.handle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-0 font-mono text-sm text-white hover:text-neon truncate"
                      >
                        @{s.handle}
                      </a>
                      <div className="font-mono font-bold tabular-nums text-neon">
                        {s.count.toLocaleString()}
                        <span className="text-[10px] text-zinc-500 ml-1 font-normal">
                          refs
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold font-orbitron uppercase tracking-wide text-zinc-200 flex items-center gap-2">
                  <EmojiIcon size={18}>📤</EmojiIcon>
                  Your turn
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  Share TOKEN$HIT with your X. Friends join → you stack{" "}
                  <span className="text-neon font-mono font-semibold">
                    {REFERRAL_REWARD_SHIT.toLocaleString()}
                  </span>{" "}
                  $TOKENSHIT per paid ref. Quality gates apply (X + PFP +
                  followers).
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-zinc-500 font-mono">
                  <li>
                    · network size{" "}
                    <span className="text-zinc-300">
                      {stats.share.totalRefs.toLocaleString()}
                    </span>
                  </li>
                  <li>
                    · avg refs / sharer{" "}
                    <span className="text-zinc-300">
                      {stats.share.uniqueSharers > 0
                        ? (
                            stats.share.totalRefs / stats.share.uniqueSharers
                          ).toFixed(1)
                        : "—"}
                    </span>
                  </li>
                  <li>
                    · paid rate{" "}
                    <span className="text-zinc-300">
                      {stats.share.totalRefs > 0
                        ? `${(
                            (100 * stats.share.paidRewards) /
                            stats.share.totalRefs
                          ).toFixed(1)}%`
                        : "—"}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <ShareRefButton path="/" variant="inline" />
                <Link
                  href="/referrals"
                  className="inline-flex items-center justify-center min-h-11 rounded-xl border border-zinc-600 px-4 text-xs font-semibold text-zinc-200 hover:border-neon"
                >
                  Referral dashboard
                </Link>
              </div>
            </section>
          </div>
        </section>

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
