import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { EmojiIcon } from "@/components/EmojiIcon";

export const metadata: Metadata = pageMeta({
  title: "Posters",
  description:
    "TOKEN$HIT square posters — Play, KOLs, claims. Always with brand icons.",
  path: "/posters",
});

type Poster = {
  title: string;
  blurb: string;
  href: string;
  src: string;
  src2x?: string;
};

const POSTERS: Poster[] = [
  {
    title: "Massive play board",
    blurb: "30 tokens available to play",
    href: "/play",
    src: "/brand/massive-play-poster.png",
    src2x: "/brand/massive-play-poster@2x.png",
  },
  {
    title: "150k in the pot",
    blurb: "150,000 SH!T currently in the Play pot",
    href: "/play",
    src: "/brand/pot-150k-poster.png",
    src2x: "/brand/pot-150k-poster@2x.png",
  },
  {
    title: "Free Play",
    blurb: "FREE · 1 UP + 1 DOWN · top 3 win · 10k/hr",
    href: "/play",
    src: "/brand/play-poster.png",
    src2x: "/brand/play-poster@2x.png",
  },
  {
    title: "HIT / SHIT hour",
    blurb: "Hour game brand lockup",
    href: "/play",
    src: "/brand/hit-shit-hour-poster.png",
    src2x: "/brand/hit-shit-hour-poster@2x.png",
  },
  {
    title: "KOLs",
    blurb: "Scout the court",
    href: "/kols",
    src: "/brand/kols-poster.png",
    src2x: "/brand/kols-poster@2x.png",
  },
  {
    title: "Jup like claim",
    blurb: "Verified like reward",
    href: "/claim",
    src: "/brand/jup-like-claim-poster.png",
    src2x: "/brand/jup-like-claim-poster@2x.png",
  },
];

export default function PostersPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 pb-16">
      <header className="mb-8 text-center sm:text-left">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.2em] text-neon">
          Brand · publish always
        </p>
        <h1 className="mt-2 font-monoton text-3xl sm:text-4xl leading-none">
          <span className="neon-dollar">$</span>
          <span className="neon-text">POSTERS</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-zinc-400 leading-relaxed">
          Square posters live on the site — never desk-only. Every poster includes
          brand{" "}
          <EmojiIcon size={14} className="inline-block align-[-2px]">
            🎯
          </EmojiIcon>{" "}
          icons and/or token marks (no bare system emoji).
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {POSTERS.map((p) => (
          <article
            key={p.src}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <a href={p.src} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.title}
                className="aspect-square w-full object-cover bg-zinc-950"
              />
            </a>
            <div className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <h2 className="font-orbitron text-sm font-bold text-zinc-100">
                  {p.title}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">{p.blurb}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5 text-right">
                <Link
                  href={p.href}
                  className="text-[11px] font-semibold text-neon hover:underline"
                >
                  Open →
                </Link>
                <a
                  href={p.src}
                  download
                  className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
                >
                  PNG
                </a>
                {p.src2x ? (
                  <a
                    href={p.src2x}
                    download
                    className="text-[10px] font-mono text-zinc-600 hover:text-zinc-300"
                  >
                    @2x
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-zinc-600 font-mono">
        <Link href="/brand" className="text-neon-blue hover:underline">
          /brand
        </Link>
        {" · "}
        <Link href="/play" className="text-neon-blue hover:underline">
          /play
        </Link>
        {" · "}
        tokenshit.com/posters
      </p>
    </div>
  );
}
