import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import KolLoveCard from "@/components/KolLoveCard";
import { EmojiIcon } from "@/components/EmojiIcon";
import { normalizeKolHandle } from "@/lib/kol-noms";
import { fetchXUserPublic } from "@/lib/x-data";
import { KOL_OG_QUOTE } from "@/lib/kol-og-quote";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle: raw } = await params;
  const handle = normalizeKolHandle(raw);
  if (!handle) {
    return { title: "KOL · TOKEN$HIT" };
  }
  let name = handle;
  let followers = 0;
  try {
    const x = await fetchXUserPublic(handle);
    if (x.ok) {
      name = x.name || handle;
      followers = x.followers || 0;
    }
  } catch {
    /* */
  }
  const title = `@${handle} — ${KOL_OG_QUOTE}`;
  const description =
    followers > 0
      ? `${name} (@${handle}, ${followers.toLocaleString()} followers) on TOKEN$HIT. ${KOL_OG_QUOTE}`
      : `${name} (@${handle}) on TOKEN$HIT. ${KOL_OG_QUOTE}`;
  const path = `/kols/${handle}`;
  // Absolute URLs — no default.png. Prefer file OG route + API fallback.
  const ogPrimary = `https://tokenshit.com/kols/${handle}/opengraph-image?v=10`;
  const ogApi = `https://tokenshit.com/api/kols/card/${handle}?v=10`;
  return {
    title,
    description,
    alternates: { canonical: `https://tokenshit.com${path}` },
    openGraph: {
      title,
      description,
      url: `https://tokenshit.com${path}`,
      type: "website",
      siteName: "TOKEN$HIT",
      images: [
        {
          url: ogPrimary,
          secureUrl: ogPrimary,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: title,
        },
        {
          url: ogApi,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@Tokenshit_",
      site: "@Tokenshit_",
      images: [ogPrimary, ogApi],
    },
  };
}

export default async function KolHandlePage({ params }: Props) {
  const { handle: raw } = await params;
  const handle = normalizeKolHandle(raw);
  if (!handle) notFound();

  let name: string | null = null;
  let followers: number | null = null;
  let avatarUrl: string | null = null;
  try {
    const x = await fetchXUserPublic(handle);
    if (x.ok) {
      name = x.name || null;
      followers = x.followers ?? null;
      avatarUrl = x.profileImageUrl || null;
    }
  } catch {
    /* still show card */
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-6 text-center">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.25em] text-zinc-500 flex items-center justify-center gap-1.5">
          <EmojiIcon size={14}>💩</EmojiIcon>
          KOL card
          <EmojiIcon size={14}>💚</EmojiIcon>
        </p>
        <h1 className="mt-2 font-monoton text-3xl leading-none tracking-wide sm:text-4xl">
          <span className="neon-text">KOL</span>
          <span className="neon-dollar">$</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400 flex items-center justify-center gap-1.5 flex-wrap">
          <EmojiIcon size={16}>🔥</EmojiIcon>
          Shareable love card · copy or download
          <EmojiIcon size={16}>✨</EmojiIcon>
        </p>
      </div>

      <KolLoveCard
        handle={handle}
        name={name}
        followers={followers}
        avatarUrl={avatarUrl}
      />

      <p className="mt-8 text-center text-xs text-zinc-600">
        <Link href="/kols" className="text-neon-blue hover:underline">
          ← All KOLs
        </Link>
        {" · "}
        <Link href="/memes" className="text-zinc-400 hover:underline">
          Memes
        </Link>
      </p>
    </main>
  );
}
