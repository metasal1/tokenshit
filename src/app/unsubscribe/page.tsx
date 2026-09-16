import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import UnsubscribeForm from "./UnsubscribeForm";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Unsubscribe",
    description: "Leave the TOKENSHIT mailing list.",
    path: "/unsubscribe",
  }),
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function UnsubscribePage() {
  return (
    <article className="mx-auto max-w-md px-4 py-10 sm:py-14 space-y-6">
      <header className="space-y-2 text-center">
        <p className="font-orbitron text-[10px] uppercase tracking-[0.22em] text-neon">
          TOKENSHIT LIST
        </p>
        <h1 className="font-monoton text-3xl sm:text-4xl text-white leading-none">
          UNSUBSCRIBE
        </h1>
        <p className="text-sm text-zinc-400">
          Leave the mailing list. The rest of the app stays.
        </p>
      </header>
      <Suspense
        fallback={
          <p className="text-center text-sm text-zinc-500">Loading...</p>
        }
      >
        <UnsubscribeForm />
      </Suspense>
    </article>
  );
}
