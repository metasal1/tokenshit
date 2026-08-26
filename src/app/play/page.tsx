import type { Metadata } from "next";
import DayGamePanel from "@/components/DayGamePanel";
import { PLAY_PRODUCT } from "@/lib/hour-product";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: PLAY_PRODUCT.name,
  description: PLAY_PRODUCT.blurb,
  path: PLAY_PRODUCT.path,
});

export default function PlayPage() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-env(safe-area-inset-top)-3.25rem-4rem)] w-full max-w-[1600px] flex-col px-3 sm:px-4 lg:px-6 md:h-[calc(100dvh-env(safe-area-inset-top)-3.5rem)]">
      <DayGamePanel />
    </div>
  );
}
