import type { Metadata } from "next";
import { Suspense } from "react";
import WinnersBoard from "@/components/WinnersBoard";
import { EmojiIcon } from "@/components/EmojiIcon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Winners — Hitters & Shitters",
  description:
    "Past Hit and Shit of the Hour bags and wallet winners on TOKEN$HIT.",
};

function Fallback() {
  return (
    <div className="flex justify-center py-20">
      <EmojiIcon size={32} className="animate-spin opacity-80" label="Loading">
        💫
      </EmojiIcon>
    </div>
  );
}

export default function WinnersPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <WinnersBoard initialSide="hit" />
    </Suspense>
  );
}
