import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PLAY_PRODUCT } from "@/lib/hour-product";
import { pageMeta } from "@/lib/seo";

/** /day → /play */
export const metadata: Metadata = pageMeta({
  title: PLAY_PRODUCT.name,
  description: PLAY_PRODUCT.blurb,
  path: "/day",
  og: "day",
});

export default function DayRedirect() {
  redirect(PLAY_PRODUCT.path);
}
