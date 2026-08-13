import { redirect } from "next/navigation";

/** Legacy → /winners?side=shit */
export default function ShittersRedirect() {
  redirect("/winners?side=shit");
}
