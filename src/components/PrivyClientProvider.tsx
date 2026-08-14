"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { useEffect, useMemo, useState } from "react";
import { getPrivyConfig } from "@/lib/privy-config";
import { registerSeedVaultMwa } from "@/lib/mwa";

export default function PrivyClientProvider({
  children,
  appId,
}: {
  children: React.ReactNode;
  appId: string;
}) {
  const [redirect, setRedirect] = useState(
    "https://tokenshit.com/auth/oauth-return"
  );
  useEffect(() => {
    setRedirect(`${window.location.origin}/auth/oauth-return`);
    registerSeedVaultMwa();
  }, []);
  const config = useMemo(
    () => getPrivyConfig({ oauthRedirectUrl: redirect }),
    [redirect]
  );
  return (
    <PrivyProvider appId={appId} config={config}>
      {children}
    </PrivyProvider>
  );
}
