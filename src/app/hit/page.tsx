import type { Metadata } from "next";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";
import { SHIT_SYMBOL } from "@/lib/shit-token";

export async function generateMetadata(): Promise<Metadata> {
  const base = pageMeta({
    title: `HIT · Play $${SHIT_SYMBOL}`,
    description:
      "HIT — green target. Play the bull case every hour. Winners split the pot.",
    path: "/hit",
  });
  const ogUrl = "https://tokenshit.com/hit/opengraph-image?v=1";
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: "HIT — TOKEN$HIT" }],
    },
    twitter: {
      ...base.twitter,
      images: [ogUrl],
    },
  };
}

export default function HitPage() {
  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-lg flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <div
        className="flex h-40 w-40 items-center justify-center rounded-3xl border-2 border-neon bg-card shadow-[0_0_40px_rgba(57,255,20,0.35)]"
        style={{ cursor: "var(--cursor-hit)" }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none" aria-hidden>
          <circle cx="16" cy="16" r="14" stroke="#39ff14" strokeWidth="2" />
          <circle cx="16" cy="16" r="9" stroke="#39ff14" strokeWidth="1.75" />
          <circle cx="16" cy="16" r="3" fill="#39ff14" />
          <line x1="16" y1="2" x2="16" y2="7" stroke="#39ff14" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="25" x2="16" y2="30" stroke="#39ff14" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="16" x2="7" y2="16" stroke="#39ff14" strokeWidth="2" strokeLinecap="round" />
          <line x1="25" y1="16" x2="30" y2="16" stroke="#39ff14" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="font-monoton text-5xl text-neon leading-none">HIT</h1>
      <p className="text-sm text-zinc-400 max-w-sm">
        Green target · play the bull case. Hourly pot · winners split.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/play"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-neon px-6 py-3 text-sm font-bold text-black"
        >
          <EmojiIcon size={18}>🎯</EmojiIcon>
          Play HIT
        </Link>
        <Link
          href="/shit"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm text-zinc-300 hover:border-red-400/50"
        >
          See SHIT
        </Link>
      </div>
      <p className="text-[11px] font-mono text-zinc-600">
        OG · tokenshit.com/hit/opengraph-image
      </p>
    </div>
  );
}
