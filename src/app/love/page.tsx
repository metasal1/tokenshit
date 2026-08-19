import type { Metadata } from "next";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";
import { LOVE_GAS_TWEET, loveGasTweetIntentUrl } from "@/lib/shit-token";
import { loadLoveReferrer } from "@/lib/love-og";
import { prewarmLoveOg } from "@/lib/love-og-cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { searchParams: Promise<{ ref?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const ref = (sp.ref || "").replace(/^@/, "").trim().toLowerCase();
  const referrer = await loadLoveReferrer(ref);
  const og =
    referrer.handle
      ? `https://tokenshit.com/api/love/og?ref=${encodeURIComponent(referrer.handle)}&v=5`
      : "https://tokenshit.com/love/opengraph-image?v=5";

  const title = referrer.handle
    ? `I LOVE TOKENSHIT — via @${referrer.handle}`
    : "I LOVE TOKENSHIT";
  const description = referrer.handle
    ? `@${referrer.handle} says I LOVE TOKENSHIT on TOKEN$HIT — every token is shit until proven otherwise. Join the bag on Solana.`
    : "I LOVE TOKENSHIT 💚 — every token is shit until proven otherwise. Tweet @tokenshit_ and join the bag on Solana.";

  const base = pageMeta({
    title,
    description,
    path: referrer.handle ? `/love?ref=${referrer.handle}` : "/love",
    og: "default",
  });

  // Don't await in metadata (slows FB HTML fetch). Bg bake via image route.
  void prewarmLoveOg(referrer.handle).catch(() => false);

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      title,
      description,
      url: referrer.handle
        ? `https://tokenshit.com/love?ref=${referrer.handle}`
        : "https://tokenshit.com/love",
      images: [
        {
          url: og,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: title,
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}

export default async function LovePage({ searchParams }: Props) {
  const sp = await searchParams;
  const ref = (sp.ref || "").replace(/^@/, "").trim().toLowerCase();
  const referrer = await loadLoveReferrer(ref);
  // Human opened /love?ref= — bake personalized OG before they hit Share
  if (referrer.handle) {
    void prewarmLoveOg(referrer.handle).catch(() => false);
  }
  const intent = loveGasTweetIntentUrl(referrer.handle);
  const avatar =
    referrer.pfp ||
    (referrer.handle
      ? `https://unavatar.io/twitter/${encodeURIComponent(referrer.handle)}`
      : null);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10 sm:py-14">
      <div className="mb-6 text-center">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.25em] text-neon flex items-center justify-center gap-1.5">
          <EmojiIcon size={14}>💚</EmojiIcon>
          Love drop
          <EmojiIcon size={14}>🔥</EmojiIcon>
        </p>
        <h1 className="mt-2 font-monoton text-4xl sm:text-5xl leading-none tracking-wide">
          <span className="neon-text">I LOVE</span>
          <br />
          <span className="neon-text">TOKEN</span>
          <span className="neon-dollar">$</span>
          <span className="neon-text">HIT</span>
        </h1>
      </div>

      {referrer.handle ? (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-neon/35 bg-card p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar || undefined}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 rounded-full border-[3px] border-neon object-cover bg-zinc-900 shadow-[0_0_28px_rgba(57,255,20,0.35)]"
            referrerPolicy="no-referrer"
          />
          <div className="text-center">
            <div className="font-semibold text-white text-lg">
              {referrer.name || `@${referrer.handle}`}
            </div>
            <a
              href={`https://x.com/${referrer.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-neon text-sm hover:underline"
            >
              @{referrer.handle}
            </a>
            <p className="mt-2 text-xs text-zinc-500">
              sent you the love link
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <p className="text-sm text-zinc-300 text-center leading-relaxed">
          Tweet exactly, then claim on{" "}
          <Link href="/claim" className="text-neon hover:underline">
            /claim
          </Link>{" "}
          for ~67 plays of SOL gas.
        </p>
        <pre className="rounded-xl border border-neon/30 bg-zinc-950 px-3 py-3 text-xs sm:text-sm text-neon font-mono whitespace-pre-wrap break-words text-center">
          {LOVE_GAS_TWEET}
        </pre>
        <a
          href={intent}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-400 active:scale-[0.98]"
        >
          <span className="font-black">𝕏</span>
          Tweet it
        </a>
        <Link
          href="/claim"
          className="flex min-h-12 items-center justify-center rounded-xl bg-neon text-black text-sm font-bold hover:brightness-110 active:scale-[0.98]"
        >
          Claim 67 plays
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-zinc-600">
        <Link href="/play" className="text-neon-blue hover:underline">
          Play
        </Link>
        {" · "}
        <Link href="/kols" className="hover:underline">
          Scout KOLs
        </Link>
        {" · "}
        <Link href="/" className="hover:underline">
          Home
        </Link>
      </p>
    </main>
  );
}
