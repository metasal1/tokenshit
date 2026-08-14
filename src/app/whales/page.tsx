import type { Metadata } from "next";
import WhalesBoard from "@/components/WhalesBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Whales — $TOKENSHIT holders",
  description:
    "Top TOKENSHIT holders, hold time, and balance movements. Watch the bag.",
  alternates: { canonical: "/whales" },
};

export default function WhalesPage() {
  return <WhalesBoard />;
}
