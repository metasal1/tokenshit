import { redirect } from "next/navigation";

/** /hour/* → /play/* */
export default async function HourDateRedirect({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  redirect(`/play/${encodeURIComponent(date)}`);
}
