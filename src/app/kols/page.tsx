import type { Metadata } from "next";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import KolNominateForm from "@/components/KolNominateForm";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMeta({
  title: "KOLs",
  description:
    "Nominate Crypto Twitter KOLs. Vote HIT or SHIT — coming soon on TOKEN$HIT.",
  path: "/kols",
});

export default function KolsComingSoonPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10 sm:py-14">
      <div className="mb-6 text-center">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          Coming soon · nominations open
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
          Every KOL is shit until proven otherwise. Suggest who belongs on the
          board — we curate, then voting goes live.
        </p>
      </div>

      <div className="mb-6">
        <KolNominateForm />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-zinc-950/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neon/30 bg-zinc-900 text-lg">
              <EmojiIcon size={28}>🎯</EmojiIcon>
            </div>
            <div className="min-w-0 flex-1">
              <div className="skeleton mb-1.5 h-3.5 w-28 rounded" />
              <div className="skeleton h-2.5 w-16 rounded" />
            </div>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-orbitron text-[10px] uppercase tracking-wider text-amber-300">
              Soon
            </span>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <p className="text-center font-mono text-[11px] text-zinc-500">
            Vote court loading after roster lock
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-xl border-[3px] border-green-900/50 bg-green-950/30 opacity-60">
              <EmojiIcon size={32}>🎯</EmojiIcon>
              <span className="font-orbitron text-xs uppercase tracking-wider text-green-400/80">
                HIT
              </span>
            </div>
            <div className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-xl border-[3px] border-red-900/50 bg-red-950/30 opacity-60">
              <EmojiIcon size={32}>💀</EmojiIcon>
              <span className="font-orbitron text-xs uppercase tracking-wider text-red-400/80">
                SHIT
              </span>
            </div>
          </div>

          <ul className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-3 font-mono text-[11px] text-zinc-500">
            <li className="flex gap-2">
              <span className="text-neon">→</span>
              Nominate CT KOLs now
            </li>
            <li className="flex gap-2">
              <span className="text-neon">→</span>
              Accepted noms get scout credit later
            </li>
            <li className="flex gap-2">
              <span className="text-neon">→</span>
              HIT / SHIT boards when live
            </li>
          </ul>
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
          href="/"
          className="rounded-full border border-zinc-700 px-5 py-2.5 text-zinc-300 hover:border-zinc-500"
        >
          Rate bags
        </Link>
      </div>
    </main>
  );
}
