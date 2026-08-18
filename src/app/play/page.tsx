import type { Metadata } from "next";
import DayGamePanel from "@/components/DayGamePanel";
import { PlayMatchShell } from "@/components/PlayMatchShell";
import { PLAY_PRODUCT } from "@/lib/hour-product";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: PLAY_PRODUCT.name,
  description: PLAY_PRODUCT.blurb,
  path: PLAY_PRODUCT.path,
});

/**
 * Canonical play page — $HIT OF THE DAY
 * Fills viewport; DayGamePanel dock handles play without page scroll.
 */
export default function PlayPage() {
  return (
    <PlayMatchShell
      fill
      title={
        <>
          <span className="neon-dollar">$</span>
          <span className="neon-text">HIT</span>
        </>
      }
      titleAccent="of the day"
      links={[
        { href: PLAY_PRODUCT.winnersPath, label: "Winners", primary: true },
        { href: "/memes", label: "Memes" },
        { href: "/referrals", label: "Refer" },
        { href: "/boards", label: "Boards" },
      ]}
    >
      <DayGamePanel compactTitle dense />
    </PlayMatchShell>
  );
}
