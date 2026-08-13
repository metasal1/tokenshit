import type { Metadata } from "next";
import DayGamePanel from "@/components/DayGamePanel";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hit / Shit of the Hour",
  description:
    "Stake 1,000 $TOKENSHIT on a major every UTC hour. Best price % wins HIT pot; worst wins SHIT pot. VRF winner. 25% treasury.",
};

export default function DayPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10 space-y-4">
      <DayGamePanel />
      <p className="text-center text-[11px] text-zinc-600">
        <Link href="/" className="text-neon-blue hover:underline">
          ← Home
        </Link>
        {" · "}
        Hourly UTC · real majors · 1 wallet = 1 ticket · volume tie-break
      </p>
    </div>
  );
}
