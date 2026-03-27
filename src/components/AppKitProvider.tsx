"use client";

import { type ReactNode, useEffect } from "react";

let initialized = false;

async function initAppKit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const { createAppKit } = await import("@reown/appkit/react");
  const { SolanaAdapter } = await import("@reown/appkit-adapter-solana/react");
  const { solana } = await import("@reown/appkit/networks");

  const solanaAdapter = new SolanaAdapter({ wallets: [] });

  createAppKit({
    adapters: [solanaAdapter],
    networks: [solana],
    projectId: "4499e1781ee00a4aee0b53ee5d1df999",
    metadata: {
      name: "TokenShit",
      description: "Every token is shit until proven otherwise",
      url: "https://tokenshit.com",
      icons: ["https://tokenshit.com/favicon.ico"],
    },
    features: {
      socials: ["x"],
      email: false,
      connectMethodsOrder: ["social"],
    } as Record<string, unknown>,
    enableWalletConnect: false,
  });
}

export default function AppKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initAppKit();
  }, []);

  return <>{children}</>;
}
