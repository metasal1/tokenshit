import type { Metadata } from "next";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";
import { resolveAssetMeta, extractMint } from "@/lib/resolveMeta";
import { SHIT_SYMBOL } from "@/lib/shit-token";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw);
  const meta = await resolveAssetMeta(token).catch(() => ({
    name: token,
    symbol: "",
    logo: "",
  }));
  const titleSym = meta.symbol || meta.name || token;
  const ogUrl = `https://tokenshit.com/shit/${encodeURIComponent(token)}/opengraph-image?v=1`;
  const base = pageMeta({
    title: `SHIT · ${titleSym}`,
    description: `Vote SHIT on ${meta.name || titleSym}. Every token is shit until proven otherwise.`,
    path: `/shit-${token}`,
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      url: `https://tokenshit.com/shit-${token}`,
      images: [
        { url: ogUrl, width: 1200, height: 630, alt: `SHIT ${titleSym}` },
      ],
    },
    twitter: {
      ...base.twitter,
      images: [ogUrl],
    },
  };
}

export default async function ShitTokenPage({ params }: Props) {
  const { token: raw } = await params;
  const token = decodeURIComponent(raw);
  const meta = await resolveAssetMeta(token).catch(() => ({
    name: token,
    symbol: "",
    logo: "",
  }));
  const mint = extractMint(token);
  const title = meta.symbol || meta.name || token;
  const tokenHref = mint
    ? `/token/${encodeURIComponent(token)}?mint=${encodeURIComponent(mint)}`
    : `/token/${encodeURIComponent(token)}`;

  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-lg flex-col items-center justify-center gap-5 px-4 py-10 text-center">
      <p className="text-[10px] font-orbitron uppercase tracking-[0.2em] text-red-400">
        SHIT · ${SHIT_SYMBOL}
      </p>
      <div
        className="flex h-36 w-36 items-center justify-center rounded-3xl border-2 border-red-400/80 bg-card shadow-[0_0_40px_rgba(248,113,113,0.35)] overflow-hidden"
        style={{ cursor: "var(--cursor-shit)" }}
      >
        {meta.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meta.logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg width="100" height="100" viewBox="0 0 32 32" fill="none" aria-hidden>
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
        )}
      </div>
      <h1 className="font-monoton text-4xl text-red-400 leading-none">SHIT</h1>
      <p className="text-xl font-bold text-white font-orbitron">${title}</p>
      {meta.name && meta.name !== title ? (
        <p className="text-sm text-zinc-400">{meta.name}</p>
      ) : null}
      <p className="text-xs font-mono text-zinc-600 break-all">/shit-{token}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={tokenHref}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-red-400 px-6 py-3 text-sm font-bold text-black"
        >
          <EmojiIcon size={18}>💀</EmojiIcon>
          Vote SHIT
        </Link>
        <Link
          href={`/hit-${token}`}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm text-zinc-300"
        >
          HIT this token
        </Link>
      </div>
    </div>
  );
}
