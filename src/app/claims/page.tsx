import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

/** /claims → /claim (alias for OG + old links) */
export const metadata: Metadata = pageMeta({
  title: "Claim",
  description: "Claim free $TOKENSHIT rewards — tweet, follow, fork, list.",
  path: "/claims",
  og: "claims",
});

export default function ClaimsAlias() {
  redirect("/claim");
}
