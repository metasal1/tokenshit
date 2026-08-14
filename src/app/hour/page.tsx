import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PLAY_PRODUCT } from "@/lib/hour-product";
import { pageMeta } from "@/lib/seo";

/** /hour → /play */
export const metadata: Metadata = pageMeta({
  title: PLAY_PRODUCT.name,
  description: PLAY_PRODUCT.blurb,
  path: "/hour",
  og: "hour",
});

export default function HourRedirect() {
  redirect(PLAY_PRODUCT.path);
}
