import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Referrals",
  description:
    "Earn $TOKENSHIT for every friend who joins with your link. Share your ref.",
  path: "/referrals",
  og: "referrals",
});

export default function ReferralsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
