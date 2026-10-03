import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import MakeForm from "./MakeForm";

export const metadata: Metadata = pageMeta({
  title: "Make token",
  description:
    "Launch a token on TOKEN$HIT. We pay create. Your wallet gets the first $1 buy free.",
  path: "/make",
  og: "default",
});

export default function MakePage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 pb-16">
      <header className="mb-8 text-center sm:text-left">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.2em] text-neon">
          Launch
        </p>
        <h1 className="mt-2 font-monoton text-3xl sm:text-4xl leading-none">
          <span className="neon-text">MAKE</span>
        </h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          We pay the launch. You pick HIT or SHIT mint. Paste a wallet to
          receive the first $1 buy, free.
        </p>
      </header>
      <MakeForm />
    </div>
  );
}
