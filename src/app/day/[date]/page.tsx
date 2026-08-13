import { redirect } from "next/navigation";

/** /day/* → /play/* */
export default async function DayDateRedirect({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  redirect(`/play/${encodeURIComponent(date)}`);
}
