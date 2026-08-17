import type { Metadata } from "next";
import { Suspense } from "react";
import HitShitBoards from "@/components/HitShitBoards";
import { EmojiIcon } from "@/components/EmojiIcon";
import { pageMeta } from "@/lib/seo";
import { PLAY_PRODUCT } from "@/lib/hour-product";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "HIT / SHIT Boards",
  description: `Hourly, daily, and weekly HIT and SHIT boards for ${PLAY_PRODUCT.name}.`,
  path: "/boards",
  og: "boards",
});

export default function BoardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <EmojiIcon size={28} className="animate-spin">
            💫
          </EmojiIcon>
        </div>
      }
    >
      <HitShitBoards />
    </Suspense>
  );
}
