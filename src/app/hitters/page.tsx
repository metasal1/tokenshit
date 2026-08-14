/** Legacy → /winners?side=hit */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Hitters",
  description: "HIT side winners on TOKEN$HIT.",
  path: "/hitters",
  og: "winners",
  noIndex: true,
});

export default function HittersRedirect() {
  redirect("/winners?side=hit");
}
