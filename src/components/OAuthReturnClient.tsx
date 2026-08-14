"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { EmojiIcon } from "@/components/EmojiIcon";
import { takeOAuthReturnPath } from "@/lib/pwa-auth";

/**
 * OAuth landing for PWA full-page Twitter/GitHub flows.
 * Privy completes session from URL; we bounce to the stashed path.
 */
export default function OAuthReturnClient() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [msg, setMsg] = useState("Finishing login…");

  useEffect(() => {
    if (!ready) return;
    const target = takeOAuthReturnPath();
    if (authenticated) {
      setMsg("You're in — redirecting…");
      const t = window.setTimeout(() => {
        router.replace(target || "/");
      }, 400);
      return () => clearTimeout(t);
    }
    // Privy may still be hydrating OAuth params
    const t = window.setTimeout(() => {
      if (!authenticated) {
        setMsg("Login incomplete. Try Email or X again from the app.");
      }
    }, 8000);
    const t2 = window.setTimeout(() => {
      // still try home so user isn't stuck
      router.replace(target || "/");
    }, 12_000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [ready, authenticated, router]);

  return (
    <div className="min-h-[50dvh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <EmojiIcon size={28} className="animate-spin" label="Loading">
        💫
      </EmojiIcon>
      <p className="text-sm text-zinc-300">{msg}</p>
      <p className="text-[10px] text-zinc-600 font-mono">oauth-return · pwa</p>
    </div>
  );
}
