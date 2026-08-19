import type { Metadata } from "next";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import KolNominateForm from "@/components/KolNominateForm";
import { pageMeta } from "@/lib/seo";
import { listApprovedKols } from "@/lib/kol-noms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = pageMeta({
  title: "KOLs",
  description:
    "Approved Crypto Twitter KOLs on TOKEN$HIT. Nominate more — HIT or SHIT court.",
  path: "/kols",
});

function fmtFollowers(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default async function KolsPage() {
  const approved = await listApprovedKols(200).catch(() => []);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-6 text-center">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.25em] text-zinc-500 flex items-center justify-center gap-1.5">
          <EmojiIcon size={14}>🎯</EmojiIcon>
          {approved.length > 0
            ? `${approved.length} approved`
            : "Nominations open"}
          <EmojiIcon size={14}>💩</EmojiIcon>
        </p>
        <h1 className="mt-2 font-monoton text-4xl leading-none tracking-wide sm:text-5xl">
          <span className="neon-text">KOL</span>
          <span className="neon-dollar">$</span>
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Rate CT voices.{" "}
          <span className="text-zinc-200">HIT or SHIT.</span>
        </p>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
          Every KOL is shit until proven otherwise. Approved cards below —
          nominate who should join the board.
        </p>
      </div>

      {/* Approved roster */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-orbitron text-xs uppercase tracking-wider text-zinc-300">
            Approved
          </h2>
          <span className="font-mono text-[10px] text-zinc-600">
            {approved.length} live
          </span>
        </div>

        {approved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/40 px-4 py-8 text-center">
            <p className="text-sm text-zinc-400">No approved KOLs yet</p>
            <p className="mt-1 text-xs text-zinc-600">
              Nominate below — Metasal reviews at /admin?tab=kols
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {approved.map((k) => {
              const avatar =
                k.avatarUrl?.replace("_normal", "_bigger").replace(
                  "_normal",
                  "_400x400"
                ) ||
                `https://unavatar.io/twitter/${encodeURIComponent(k.handle)}`;
              return (
                <li key={`${k.handle}-${k.id}`}>
                  <Link
                    href={`/kols/${encodeURIComponent(k.handle)}`}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-neon/40 hover:shadow-[0_0_24px_rgba(57,255,20,0.08)] active:scale-[0.99]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatar}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full border border-neon/35 bg-zinc-900 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold text-white text-sm">
                          {k.displayName || `@${k.handle}`}
                        </span>
                        {k.status === "live" ? (
                          <span className="shrink-0 rounded-full border border-neon/40 bg-neon/10 px-1.5 py-0.5 font-orbitron text-[9px] uppercase text-neon">
                            Live
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full border border-sky-700/50 bg-sky-950/40 px-1.5 py-0.5 font-orbitron text-[9px] uppercase text-sky-300">
                            Approved
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-zinc-500 truncate">
                        @{k.handle}
                        {k.followers != null
                          ? ` · ${fmtFollowers(k.followers)} flw`
                          : ""}
                      </div>
                    </div>
                    <span className="shrink-0 text-neon text-lg" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mb-6">
        <h2 className="mb-3 font-orbitron text-xs uppercase tracking-wider text-zinc-300">
          Nominate
        </h2>
        <KolNominateForm />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-zinc-950/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neon/30 bg-zinc-900 text-lg">
              <EmojiIcon size={28}>🎯</EmojiIcon>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">HIT / SHIT court</p>
              <p className="text-[11px] text-zinc-500 font-mono">
                Voting boards coming soon
              </p>
            </div>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-orbitron text-[10px] uppercase tracking-wider text-amber-300">
              Soon
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border-[3px] border-green-900/50 bg-green-950/30 opacity-70">
            <EmojiIcon size={28}>🎯</EmojiIcon>
            <span className="font-orbitron text-xs uppercase tracking-wider text-green-400/80">
              HIT
            </span>
          </div>
          <div className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border-[3px] border-red-900/50 bg-red-950/30 opacity-70">
            <EmojiIcon size={28}>💀</EmojiIcon>
            <span className="font-orbitron text-xs uppercase tracking-wider text-red-400/80">
              SHIT
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
        <Link
          href="/play"
          className="rounded-full bg-neon px-5 py-2.5 font-bold text-black hover:bg-neon/90"
        >
          Play now
        </Link>
        <Link
          href="/claim"
          className="rounded-full border border-zinc-700 px-5 py-2.5 text-zinc-300 hover:border-zinc-500"
        >
          Claim / recommend
        </Link>
      </div>
    </main>
  );
}
