import { redirect } from "next/navigation";
import { HOUR_PRODUCT } from "@/lib/hour-product";

/** Legacy /day → canonical THE HOUR */
export default function DayRedirect() {
  redirect(HOUR_PRODUCT.path);
}
