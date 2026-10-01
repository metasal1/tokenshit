import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { EmojiIcon } from "@/components/EmojiIcon";
import {
  PLAY_POT_ADDRESS,
  PLAY_REV_ADDRESS,
  SHIT_DECIMALS,
  SHIT_MINT,
  STREAMFLOW_CONTRACT,
  STREAMFLOW_LOCK_AMOUNT,
  STREAMFLOW_URL,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";
import { BUY_FEE_BPS, SHIT_FEE_ATA } from "@/lib/buy-fee";

export const metadata: Metadata = pageMeta({
  title: "Shitpaper",
  description:
    "TOKENSHIT shitpaper — the token, the 75,000,000 Streamflow lock, and how fees fund Play and claims.",
  path: "/shitpaper",
  og: "default",
});

export const dynamic = "force-static";

const LOCK = STREAMFLOW_LOCK_AMOUNT.toLocaleString("en-US");

function Addr({ value }: { value: string }) {
  return (
    <code className="break-all font-mono text-[11px] text-zinc-300 sm:text-xs">
      {value}
    </code>
  );
}

export default function ShitpaperPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-8 sm:py-12 space-y-10 text-sm leading-relaxed text-zinc-300 pb-16">
      <header className="space-y-3 text-center sm:text-left">
        <p className="text-[10px] font-orbitron uppercase tracking-[0.22em] text-neon">
          Token · lock · fees
        </p>
        <h1 className="text-3xl sm:text-5xl font-monoton leading-none">
          <span className="neon-text">SHIT</span>
          <span className="neon-dollar">PAPER</span>
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg">
          Every token is SH!T until proven otherwise. This page is the public
          record for $TOKENSHIT: what it is, what is locked, and where fees go.
        </p>
        <p className="text-xs text-zinc-600">
          Not financial advice. Entertainment token on Solana.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-orbitron text-xs uppercase tracking-[0.18em] text-neon">
          The token
        </h2>
        <p>
          <strong className="text-zinc-100">TOKENSHIT</strong> (say SH!T) is a
          Token-2022 mint on Solana. It is a meme / utility token for Play,
          claims, KOLs, and memes on tokenshit.com. It is not equity, not a
          deposit, not a promise of return.
        </p>
        <dl className="grid gap-2 text-xs sm:text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 font-orbitron uppercase tracking-wider text-zinc-500">
              Name
            </dt>
            <dd>TokenShit</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 font-orbitron uppercase tracking-wider text-zinc-500">
              Ticker
            </dt>
            <dd>$TOKENSHIT · SH!T in tweets</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 font-orbitron uppercase tracking-wider text-zinc-500">
              Decimals
            </dt>
            <dd>{SHIT_DECIMALS}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 font-orbitron uppercase tracking-wider text-zinc-500">
              Program
            </dt>
            <dd>Token-2022</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 font-orbitron uppercase tracking-wider text-zinc-500">
              Mint
            </dt>
            <dd>
              <Addr value={SHIT_MINT} />
            </dd>
          </div>
        </dl>
        <p className="text-xs">
          Buy on{" "}
          <Link href="/swap" className="text-neon-blue hover:underline">
            /swap
          </Link>
          . Play on{" "}
          <Link href="/play" className="text-neon-blue hover:underline">
            /play
          </Link>
          . Claim on{" "}
          <Link href="/claim" className="text-neon-blue hover:underline">
            /claim
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-neon/25 bg-card p-5">
        <h2 className="font-orbitron text-xs uppercase tracking-[0.18em] text-neon">
          Streamflow lock
        </h2>
        <p>
          <strong className="text-zinc-100">{LOCK} SH!T</strong> is locked
          on-chain with Streamflow. Check it. Do not take our word.
        </p>
        <dl className="grid gap-2 text-xs sm:text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 font-orbitron uppercase tracking-wider text-zinc-500">
              Amount
            </dt>
            <dd className="font-orbitron text-neon">{LOCK}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 font-orbitron uppercase tracking-wider text-zinc-500">
              Contract
            </dt>
            <dd>
              <Addr value={STREAMFLOW_CONTRACT} />
            </dd>
          </div>
        </dl>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a
            href={STREAMFLOW_URL}
            className="text-neon hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Streamflow
          </a>
          <Link href="/posters" className="text-neon-blue hover:underline">
            Lock poster
          </Link>
        </p>
        <p className="text-xs text-zinc-500">
          Locked supply cannot be dumped from that contract until Streamflow
          releases it. Unlocked tokens still trade. DYOR on the contract.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-orbitron text-xs uppercase tracking-[0.18em] text-neon">
          How fees are used
        </h2>
        <p>
          Fees exist so Play prizes and claims can keep paying without minting
          extra SH!T. They are not a dividend.
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="text-zinc-100">Buy / swap · 1%</strong>
            <span className="text-zinc-500"> ({BUY_FEE_BPS} bps)</span>
            . Jupiter platform fee on $TOKENSHIT buys. Paid to the treasury
            SH!T ATA.
            <div className="mt-1 text-xs text-zinc-500">
              ATA <Addr value={SHIT_FEE_ATA} />
            </div>
          </li>
          <li>
            <strong className="text-zinc-100">Play house · 25%</strong> of any
            hour pot goes to the rev wallet.{" "}
            <strong className="text-zinc-100">75%</strong> splits across winning
            tickets (top 3 HIT % / bottom 3 SHIT %). Live Play is free. The
            30,000 SH!T/hr prize is paid from treasury when SHTy is funded.
          </li>
          <li>
            <strong className="text-zinc-100">DEX creator fees</strong> from
            TOKENSHIT pools accrue as wrapped SOL in the creator vault. When
            claimed they refill treasury / gas so claims and Play can send.
          </li>
        </ol>
        <p className="text-xs text-zinc-400">
          Treasury spend (in order of product): Play hour prizes, follow / like
          / RT / PumpFast claims, KOL scout bounties, referrals. No SOL on
          claims. Claims never create Token-2022 ATAs for you.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-orbitron text-xs uppercase tracking-[0.18em] text-neon">
          Wallets
        </h2>
        <dl className="grid gap-3 text-xs sm:text-sm">
          <div>
            <dt className="font-orbitron uppercase tracking-wider text-zinc-500">
              Treasury · claims + prizes
            </dt>
            <dd>
              <Addr value={TREASURY_ADDRESS} />
            </dd>
          </div>
          <div>
            <dt className="font-orbitron uppercase tracking-wider text-zinc-500">
              Play pot
            </dt>
            <dd>
              <Addr value={PLAY_POT_ADDRESS} />
            </dd>
          </div>
          <div>
            <dt className="font-orbitron uppercase tracking-wider text-zinc-500">
              Play house / rev
            </dt>
            <dd>
              <Addr value={PLAY_REV_ADDRESS} />
            </dd>
          </div>
        </dl>
      </section>

      <p className="text-center text-xs text-zinc-600 font-mono">
        <EmojiIcon size={14} className="inline-block align-[-2px]">
          🎯
        </EmojiIcon>{" "}
        tokenshit.com/shitpaper
      </p>
    </article>
  );
}
