import type { Metadata } from "next";
import DayGamePanel from "@/components/DayGamePanel";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hit / Shit of the Day",
  description:
    "Stake 1,000 $TOKENSHIT on a major. Best price % wins the HIT pot; worst wins the SHIT pot. VRF picks one wallet. 25% to treasury.",
};

export default function DayPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10 space-y-4">
      <DayGamePanel />
      <p className="text-center text-[11px] text-zinc-600">
        <Link href="/" className="text-neon-blue hover:underline">
          ← Arena
        </Link>
        {" · "}
        Rules: real majors · UTC day · 1 wallet = 1 ticket · volume tie-break
      </p>
    </div>
  );
}
