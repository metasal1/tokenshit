import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

/** Shared Helius mainnet RPC (same host used elsewhere in the app). */
export const SOLANA_HTTP_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://viviyan-bkj12u-fast-mainnet.helius-rpc.com";

export const SOLANA_WS_RPC =
  process.env.NEXT_PUBLIC_SOLANA_WS_URL ||
  SOLANA_HTTP_RPC.replace(/^https:/i, "wss:");

/**
 * Privy config for TOKENSHIT — Solana only (no EVM).
 * - appearance.walletChainType: solana-only hides ETH wallets
 * - ethereum embedded createOnLogin: off
 * - solana.rpcs required for fund/buy
 */
export function getPrivyConfig() {
  return {
    loginMethods: ["email", "twitter", "github"] as (
      | "email"
      | "twitter"
      | "github"
    )[],
    appearance: {
      theme: "dark" as const,
      accentColor: "#39ff14" as `#${string}`,
      logo: "https://tokenshit.com/icons/icon-192.png",
      /** Hide MetaMask / EVM connectors — Solana only */
      walletChainType: "solana-only" as const,
      showWalletLoginFirst: false,
    },
    embeddedWallets: {
      ethereum: {
        createOnLogin: "off" as const,
      },
      solana: {
        createOnLogin: "users-without-wallets" as const,
      },
    },
    externalWallets: {
      solana: {
        connectors: toSolanaWalletConnectors({
          // Phantom / Solflare etc. only — no WalletConnect EVM
          shouldAutoConnect: false,
        }),
      },
    },
    fundingMethodConfig: {
      moonpay: {
        useSandbox: false,
      },
    },
    solana: {
      rpcs: {
        "solana:mainnet": {
          rpc: createSolanaRpc(SOLANA_HTTP_RPC),
          rpcSubscriptions: createSolanaRpcSubscriptions(SOLANA_WS_RPC),
        },
      },
    },
  };
}
