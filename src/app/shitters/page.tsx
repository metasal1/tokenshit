import type { Metadata } from "next";
import WinnersBoard from "@/components/WinnersBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shitters — past SHIT winners",
  description:
    "Past Shit of the Hour bags and wallet winners on TOKEN$HIT.",
};

export default function ShittersPage() {
  return <WinnersBoard side="shit" />;
}
