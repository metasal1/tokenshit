/**
 * Solana Mobile Wallet Adapter (Seed Vault) for TOKENSHIT PWA.
 * Registers a wallet-standard wallet so Privy / wallet-standard can see Seed Vault
 * on Seeker / Android Chrome.
 *
 * identity.icon MUST be a relative URI (absolute https → MWA -32602).
 */
"use client";

let registered = false;

export function isAndroidLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|Seeker|SolanaMobile/i.test(ua);
}

export function registerSeedVaultMwa(): void {
  if (registered || typeof window === "undefined") return;
  registered = true;

  void import("@solana-mobile/wallet-standard-mobile")
    .then((mwa) => {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://tokenshit.com";
      mwa.registerMwa({
        appIdentity: {
          name: "TOKENSHIT",
          uri: origin,
          icon: "icons/icon-192.png",
        },
        authorizationCache: mwa.createDefaultAuthorizationCache(),
        chains: ["solana:mainnet"],
        chainSelector: mwa.createDefaultChainSelector(),
        onWalletNotFound: mwa.createDefaultWalletNotFoundHandler(),
      });
    })
    .catch((err) => {
      registered = false;
      console.warn("[mwa] Seed Vault register skipped", err);
    });
}
