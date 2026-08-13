import { redirect } from "next/navigation";
import { PLAY_PRODUCT } from "@/lib/hour-product";

/** /day → /play */
export default function DayRedirect() {
  redirect(PLAY_PRODUCT.path);
}
