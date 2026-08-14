import type { Metadata } from "next";
import MemeStudio from "@/components/MemeStudio";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Memes",
  description:
    "Caption memes with Monoton + glow. Blanks from memes.sal.fun. Download & share.",
  path: "/memes",
});

export default function MemesPage() {
  return <MemeStudio />;
}
