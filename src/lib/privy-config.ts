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
 * Privy v3+ requires config.solana.rpcs for embedded wallet
 * signAndSendTransaction / fundWallet UI. Missing this throws:
 * "No RPC configuration found for chain solana:mainnet"
 */
export function getPrivyConfig() {
  return {
    loginMethods: ["twitter", "github"] as ("twitter" | "github")[],
    appearance: {
      theme: "dark" as const,
      accentColor: "#39ff14" as `#${string}`,
    },
    embeddedWallets: {
      solana: {
        createOnLogin: "all-users" as const,
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
