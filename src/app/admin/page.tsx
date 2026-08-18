import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

/**
 * /admin is not a public surface. Real admin is server-gated via
 * ADMIN_PRIVY_ID + /api/admin/data. Page returns 404 for everyone
 * (no client chunk with PII UI shipped to anonymous users).
 */
export default function AdminPage() {
  notFound();
}
