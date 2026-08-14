import type { Metadata } from "next";
import WhalesBoard from "@/components/WhalesBoard";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Whales",
  description:
    "Top $TOKENSHIT holders, hold time, and balance movements. Watch the bag.",
  path: "/whales",
});

export default function WhalesPage() {
  return <WhalesBoard />;
}
