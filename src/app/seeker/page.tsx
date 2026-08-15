import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { EmojiIcon } from "@/components/EmojiIcon";

export const metadata: Metadata = pageMeta({
  title: "Seeker",
  description:
    "TOKEN$HIT on Solana Seeker — install, play $HIT OF THE DAY, vote, claim.",
  path: "/seeker",
});

export const dynamic = "force-static";

const STEPS = [
  {
    n: "1",
    t: "Open in Seeker browser",
    d: "Go to tokenshit.com — or install from the Solana dApp Store when listed.",
  },
  {
    n: "2",
    t: "Add to Home Screen / Install",
    d: "PWA install keeps Play + Vote one tap away. Use in-app Install tip if shown.",
  },
  {
    n: "3",
    t: "Login",
    d: "Email magic link is most reliable in standalone. X uses full-page OAuth (not popups).",
  },
  {
    n: "4",
    t: "Connect Solana wallet",
    d: "Privy embeds a Solana wallet on login. External wallets work when the OS allows.",
  },
  {
    n: "5",
    t: "Play",
    d: "$HIT OF THE DAY on /play — 1k $TOKENSHIT · HIT or SHIT · hourly UTC.",
  },
];

export default function SeekerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12 space-y-8">
      <header className="space-y-3 text-center sm:text-left">
        <p className="text-[10px] font-orbitron uppercase tracking-[0.22em] text-neon">
          Solana Mobile
        </p>
        <h1 className="text-3xl sm:text-4xl font-monoton leading-none">
          <span className="neon-text">SEEKER</span>
          <span className="text-zinc-500 font-sans text-lg sm:text-xl font-orbitron tracking-widest block sm:inline sm:ml-3 mt-2 sm:mt-0">
            READY
          </span>
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg">
          TOKEN$HIT is built mobile-first for Seeker: dense Play UI, PWA splash,
          safe-area chrome, and wallet login that works in standalone.
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { href: "/play", label: "Play", sub: "$HIT OF THE DAY" },
          { href: "/claim", label: "Claim", sub: "Rewards" },
          { href: "/swap", label: "Swap", sub: "Buy $TOKENSHIT" },
        ].map((x) => (
          <Link
            key={x.href}
            href={x.href}
            className="rounded-xl border border-neon/30 bg-card px-4 py-3 hover:border-neon/60 transition-colors"
          >
            <div className="font-orbitron text-xs uppercase tracking-wider text-neon">
              {x.label}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">{x.sub}</div>
          </Link>
        ))}
      </div>

      <ol className="space-y-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="flex gap-3 rounded-xl border border-border bg-card/80 p-3.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon/15 text-neon font-mono text-sm font-bold">
              {s.n}
            </span>
            <div>
              <div className="font-semibold text-white text-sm">{s.t}</div>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                {s.d}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <section className="rounded-2xl border border-border bg-zinc-950/80 p-4 space-y-2">
        <h2 className="text-sm font-orbitron uppercase tracking-wider text-zinc-300">
          Status
        </h2>
        <ul className="text-xs text-zinc-500 space-y-1.5">
          <li className="flex gap-2">
            <EmojiIcon size={14}>✅</EmojiIcon>
            <span>PWA v2 · splash · safe-area · offline shell</span>
          </li>
          <li className="flex gap-2">
            <EmojiIcon size={14}>✅</EmojiIcon>
            <span>Terms + Privacy (store required)</span>
          </li>
          <li className="flex gap-2">
            <EmojiIcon size={14}>✅</EmojiIcon>
            <span>Mobile Play / Vote / Claim / Swap UX</span>
          </li>
          <li className="flex gap-2">
            <EmojiIcon size={14}>💫</EmojiIcon>
            <span>dApp Store APK / TWA — see docs/SEEKER-LAUNCH.md</span>
          </li>
        </ul>
      </section>

      <p className="text-[11px] text-zinc-600 text-center sm:text-left">
        <Link href="/terms" className="text-neon-blue hover:underline">
          Terms
        </Link>
        {" · "}
        <Link href="/privacy" className="text-neon-blue hover:underline">
          Privacy
        </Link>
        {" · "}
        <a
          href="mailto:bugs@tokenshit.com"
          className="text-neon-blue hover:underline"
        >
          bugs@tokenshit.com
        </a>
      </p>
    </div>
  );
}
