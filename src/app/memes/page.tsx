import type { Metadata } from "next";
import MemeStudio from "@/components/MemeStudio";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Memes",
  description:
    "Caption memes with Monoton + glow. Filter by face. Download & share.",
  path: "/memes",
});

/**
 * Full-width MemeStudio — never wrap in PlayMatchShell (max-w-lg
 * crushed gallery + editor).
 */
export default function MemesPage() {
  return <MemeStudio />;
}
