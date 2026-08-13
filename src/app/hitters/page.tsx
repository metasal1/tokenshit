import { redirect } from "next/navigation";

/** Legacy → /winners?side=hit */
export default function HittersRedirect() {
  redirect("/winners?side=hit");
}
