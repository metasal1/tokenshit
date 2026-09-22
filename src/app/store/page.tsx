import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import StoreTee from "@/components/StoreTee";

export const metadata: Metadata = pageMeta({
  title: "Store",
  description:
    "TOKEN$HIT merch. Black cotton tee with the official mark. Ships to Australia.",
  path: "/store",
  og: "default",
});

export const dynamic = "force-static";

export default function StorePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 pb-16">
      <header className="mb-8 text-center sm:text-left">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.2em] text-neon">
          Merch
        </p>
        <h1 className="mt-2 font-monoton text-3xl sm:text-4xl leading-none">
          <span className="neon-text">STORE</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-zinc-400 leading-relaxed">
          Official TOKEN$HIT tee. Black cotton. Chest print. Ships to Australia.
        </p>
      </header>

      <article className="grid gap-8 lg:grid-cols-2 items-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/store-tee.png"
            alt="TOKEN$HIT black tee"
            className="w-full aspect-[4/5] object-cover"
          />
        </div>

        <StoreTee />
      </article>

      <p className="mt-10 text-center text-xs text-zinc-600 font-mono">
        <Link href="/brand" className="text-neon-blue hover:underline">
          /brand
        </Link>
        {" · "}
        tokenshit.com/store
      </p>
    </div>
  );
}
