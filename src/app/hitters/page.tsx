import type { Metadata } from "next";
import WinnersBoard from "@/components/WinnersBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hitters — past HIT winners",
  description:
    "Past Hit of the Hour bags and wallet winners on TOKEN$HIT.",
};

export default function HittersPage() {
  return <WinnersBoard side="hit" />;
}
