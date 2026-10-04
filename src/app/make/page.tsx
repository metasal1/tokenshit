import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import MakeForm from "./MakeForm";

export const metadata: Metadata = pageMeta({
  title: "Make token",
  description:
    "Launch a token on TOKEN$HIT. We pay create. Your wallet gets the first $1 buy free.",
  path: "/make",
  og: "default",
});

export default function MakePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 pb-20">
      <MakeForm />
    </div>
  );
}
