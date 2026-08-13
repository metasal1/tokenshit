import { redirect } from "next/navigation";
import { PLAY_PRODUCT } from "@/lib/hour-product";

/** /hour → /play */
export default function HourRedirect() {
  redirect(PLAY_PRODUCT.path);
}
