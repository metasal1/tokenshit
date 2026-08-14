import type { Metadata } from "next";
import { Suspense } from "react";
import WinnersBoard from "@/components/WinnersBoard";
import { EmojiIcon } from "@/components/EmojiIcon";
import { HOUR_PRODUCT } from "@/lib/hour-product";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Winners",
  description: `Past HIT and SHIT winners from ${HOUR_PRODUCT.name} on TOKEN$HIT.`,
  path: HOUR_PRODUCT.winnersPath,
});

export default function WinnersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <EmojiIcon size={28} className="animate-spin">
            💫
          </EmojiIcon>
        </div>
      }
    >
      <WinnersBoard initialSide="hit" />
    </Suspense>
  );
}
