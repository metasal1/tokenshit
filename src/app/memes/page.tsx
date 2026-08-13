import type { Metadata } from "next";
import MemeStudio from "@/components/MemeStudio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Memes — TOKEN$HIT studio",
  description:
    "Caption memes with Monoton + glow. Blanks from memes.sal.fun. Download & share.",
  alternates: { canonical: "/memes" },
};

export default function MemesPage() {
  return <MemeStudio />;
}
