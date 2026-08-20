import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

/**
 * Browser RPC — same-origin proxy only (never ship dedicated Helius URL).
 * Server code uses SOLANA_RPC_URL / HEIUS env privately.
 */
function browserRpcHttp(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/rpc`;
  }
  // SSR placeholder — Privy client hydrates with window origin
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.startsWith("/")
    ? `https://tokenshit.com${process.env.NEXT_PUBLIC_SOLANA_RPC_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/rpc`
      : "https://tokenshit.com/api/rpc";
}

export const SOLANA_HTTP_RPC = browserRpcHttp();

/** WS: public Solana (proxy is HTTP-only). Override with NEXT_PUBLIC_SOLANA_WS_URL. */
export const SOLANA_WS_RPC =
  process.env.NEXT_PUBLIC_SOLANA_WS_URL ||
  "wss://api.mainnet-beta.solana.com";

/**
 * Privy config for TOKENSHIT — Solana only (no EVM).
 */
export function getPrivyConfig(opts?: { oauthRedirectUrl?: string }) {
  const redirect =
    opts?.oauthRedirectUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/auth/oauth-return`
      : "https://tokenshit.com/auth/oauth-return");

  const httpRpc =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/rpc`
      : SOLANA_HTTP_RPC;

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
      walletChainType: "solana-only" as const,
      showWalletLoginFirst: false,
    },
    embeddedWallets: {
      ethereum: {
        createOnLogin: "off" as const,
      },
      solana: {
        // Always ensure a Solana embedded wallet (X+GH-only users were stuck)
        createOnLogin: "all-users" as const,
      },
    },
    externalWallets: {
      solana: {
        connectors: toSolanaWalletConnectors({
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
          rpc: createSolanaRpc(httpRpc),
          rpcSubscriptions: createSolanaRpcSubscriptions(SOLANA_WS_RPC),
        },
      },
    },
    customOAuthRedirectUrl: redirect,
    allowOAuthInEmbeddedBrowsers: true,
  };
}
