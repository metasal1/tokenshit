import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

/** /test QA surface removed from public. */
export default function TestPage() {
  notFound();
}
