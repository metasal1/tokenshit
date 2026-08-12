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
 * Privy config for TOKENSHIT.
 * - email + twitter + github (email = webview-safe signup path)
 * - solana.rpcs required for fund/buy (else "No RPC configuration found")
 * - createOnLogin only if no wallet (avoids blocking login when wallet create fails)
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
    },
    embeddedWallets: {
      solana: {
        createOnLogin: "users-without-wallets" as const,
      },
    },
    externalWallets: {
      solana: {
        connectors: toSolanaWalletConnectors(),
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
