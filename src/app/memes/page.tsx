import type { Metadata } from "next";
import MemeStudio from "@/components/MemeStudio";
import { PlayMatchShell } from "@/components/PlayMatchShell";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Memes",
  description:
    "Caption memes with Monoton + glow. Blanks from memes.sal.fun. Download & share.",
  path: "/memes",
});

export default function MemesPage() {
  return (
    <PlayMatchShell
      title={
        <>
          <span className="neon-text">MEMES</span>
        </>
      }
      titleAccent="studio"
      links={[
        { href: "/play", label: "Play", primary: true },
        { href: "/referrals", label: "Refer" },
        { href: "/boards", label: "Boards" },
      ]}
    >
      <MemeStudio embedded />
    </PlayMatchShell>
  );
}
