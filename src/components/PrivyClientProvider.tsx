"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { getPrivyConfig } from "@/lib/privy-config";

export default function PrivyClientProvider({
  children,
  appId,
}: {
  children: React.ReactNode;
  appId: string;
}) {
  return (
    <PrivyProvider appId={appId} config={getPrivyConfig()}>
      {children}
    </PrivyProvider>
  );
}
