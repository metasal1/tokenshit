import type { Metadata } from "next";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";
import { SHIT_SYMBOL } from "@/lib/shit-token";

export async function generateMetadata(): Promise<Metadata> {
  const base = pageMeta({
    title: `SHIT · Play $${SHIT_SYMBOL}`,
    description:
      "SHIT — red face. Play the bear case every hour. Winners split the pot.",
    path: "/shit",
  });
  const ogUrl = "https://tokenshit.com/shit/opengraph-image?v=1";
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: "SHIT — TOKEN$HIT" }],
    },
    twitter: {
      ...base.twitter,
      images: [ogUrl],
    },
  };
}

export default function ShitPage() {
  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-lg flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <div
        className="flex h-40 w-40 items-center justify-center rounded-3xl border-2 border-red-400/80 bg-card shadow-[0_0_40px_rgba(248,113,113,0.35)]"
        style={{ cursor: "var(--cursor-shit)" }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none" aria-hidden>
          <circle cx="16" cy="16" r="14" stroke="#f87171" strokeWidth="2" />
          <circle cx="12" cy="14" r="1.6" fill="#f87171" />
          <circle cx="20" cy="14" r="1.6" fill="#f87171" />
          <path
            d="M11 21c1.5 2 3.2 3 5 3s3.5-1 5-3"
            stroke="#f87171"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h1 className="font-monoton text-5xl text-red-400 leading-none">SHIT</h1>
      <p className="text-sm text-zinc-400 max-w-sm">
        Red face · play the bear case. Hourly pot · winners split.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/play"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-red-400 px-6 py-3 text-sm font-bold text-black"
        >
          <EmojiIcon size={18}>💀</EmojiIcon>
          Play SHIT
        </Link>
        <Link
          href="/hit"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm text-zinc-300 hover:border-neon/50"
        >
          See HIT
        </Link>
      </div>
      <p className="text-[11px] font-mono text-zinc-600">
        OG · tokenshit.com/shit/opengraph-image
      </p>
    </div>
  );
}
