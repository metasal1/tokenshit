import type { Metadata } from "next";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";
import { listApprovedKols, listKolNominations } from "@/lib/kol-noms";
import KolsClient from "./KolsClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = pageMeta({
  title: "KOLs",
  description: "HIT / SHIT court for CT KOLs. Swipe to recommend. Earn 2,500 $TOKENSHIT bounty on accepted 10k+ KOLs.",
  path: "/kols",
});

function fmtFollowers(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default async function KolsPage() {
  const approvedRaw = await listApprovedKols(150).catch(() => []);
  const pendingRaw = await listKolNominations({ status: 'pending', limit: 50 }).catch(() => []);

  // Prefer pending for swipe deck so users are recommending/vouching on nominees
  const deckSource = pendingRaw.length > 0 ? pendingRaw : approvedRaw;
  const deckKols = deckSource.map((k) => ({
    id: k.id,
    handle: k.handle,
    displayName: k.displayName,
    avatarUrl: k.avatarUrl,
    followers: k.followers,
    status: k.status,
  }));

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-10">
      <div className="mb-5 text-center">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.25em] text-neon flex items-center justify-center gap-2">
          <EmojiIcon size={13}>🎯</EmojiIcon>
          HIT / SHIT COURT
          <EmojiIcon size={13}>💚</EmojiIcon>
        </p>
        <h1 className="mt-1 font-monoton text-4xl sm:text-5xl tracking-wide">
          <span className="neon-text">KOL</span>
          <span className="neon-dollar">$</span>
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">Rate CT KOLs. Swipe left = SHIT. Right = recommend.</p>
      </div>

      <KolsClient initialKols={deckKols} totalApproved={approvedRaw.length} deckLabel={pendingRaw.length > 0 ? "Pending KOL nominations" : "KOLs"} />

      {/* Compact roster below */}
      <section id="roster" className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-orbitron text-xs uppercase tracking-wider text-zinc-400">Full roster</div>
          <span className="font-mono text-[10px] text-zinc-600">{approvedRaw.length} live</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {approvedRaw.slice(0, 12).map((k) => {
            const avatar =
              k.avatarUrl?.replace("_normal", "_bigger") ||
              `https://unavatar.io/twitter/${encodeURIComponent(k.handle)}`;
            return (
              <Link
                key={`${k.handle}-${k.id}`}
                href={`/kols/${encodeURIComponent(k.handle)}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-neon/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar}
                  alt=""
                  className="h-9 w-9 rounded-full border border-neon/30 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1 truncate">
                  <div className="font-medium text-white truncate">{k.displayName || `@${k.handle}`}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    @{k.handle} · {fmtFollowers(k.followers)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {approvedRaw.length > 12 && (
          <p className="text-center text-[10px] text-zinc-500 mt-2">+ more available in the swipe deck above</p>
        )}
      </section>

      <div className="mt-8 flex justify-center gap-3 text-sm">
        <Link href="/claim" className="rounded-full border border-zinc-700 px-5 py-2 text-zinc-300 hover:border-zinc-500">
          Claim + recommend
        </Link>
        <Link href="/play" className="rounded-full bg-neon px-5 py-2 font-bold text-black">
          Play
        </Link>
      </div>
    </main>
  );
}
