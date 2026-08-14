/** Legacy → /winners?side=shit */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Shitters",
  description: "SHIT side winners on TOKEN$HIT.",
  path: "/shitters",
  og: "winners",
  noIndex: true,
});

export default function ShittersRedirect() {
  redirect("/winners?side=shit");
}
