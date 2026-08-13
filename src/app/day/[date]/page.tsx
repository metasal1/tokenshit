import { redirect } from "next/navigation";

/** Legacy day receipt → /hour/... */
export default async function DayReceiptRedirect({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  redirect(`/hour/${encodeURIComponent(date)}`);
}
