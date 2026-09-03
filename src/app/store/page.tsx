import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Store",
  description:
    "TOKEN$HIT merch. Black cotton tee with the official mark. Ships to Australia.",
  path: "/store",
  og: "default",
});

export const dynamic = "force-static";

const SIZES = ["S", "M", "L", "XL", "2XL"] as const;

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

        <div className="space-y-6">
          <div>
            <h2 className="font-orbitron text-lg font-bold text-zinc-100">
              TOKEN$HIT Tee
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Black cotton 180G. DTF chest print. Adult unisex.
            </p>
          </div>

          <p className="font-orbitron text-2xl text-neon">$24.99 USD</p>

          <div>
            <p className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <span
                  key={s}
                  className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-md border border-zinc-700 px-3 text-sm font-orbitron text-zinc-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <ul className="text-sm text-zinc-400 space-y-1.5">
            <li>Ships to Australia. Standard from $11.</li>
            <li>Fast AU about $20. Express about $42.</li>
            <li>Printed on demand. No inventory.</li>
          </ul>

          <a
            href="https://x.com/Tokenshit_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-11 w-full sm:w-auto rounded-md bg-neon px-6 py-3 font-orbitron text-sm font-bold text-black hover:brightness-110"
          >
            Order on X
          </a>
          <p className="text-xs text-zinc-600">
            DM @Tokenshit_ with size. We fulfill via Yoycol.
          </p>
        </div>
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
