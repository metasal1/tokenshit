import type { Metadata } from "next";
import OAuthReturnClient from "@/components/OAuthReturnClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Signing in",
  robots: { index: false, follow: false },
};

export default function OAuthReturnPage() {
  return <OAuthReturnClient />;
}
