import { redirect } from "next/navigation";

/** Alias → /day (hourly game) */
export default function HourAlias() {
  redirect("/day");
}
