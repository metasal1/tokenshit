import type { Metadata } from "next";
import WalletsBoard from "@/components/WalletsBoard";
import { HOUR_PRODUCT } from "@/lib/hour-product";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Wallets",
  description: `Winner wallets, play pot, and house treasury for ${HOUR_PRODUCT.name} on TOKEN$HIT.`,
  path: "/wallets",
  og: "winners",
});

export default function WalletsPage() {
  return <WalletsBoard />;
}
