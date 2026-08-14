/**
 * GA4 + event helper. Measurement ID is hard-wired for tokenshit.com.
 * G-XTVEWC915F (dedicated property — do not reuse other domains).
 */
export const GA_MEASUREMENT_ID = "G-XTVEWC915F";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(
  event: string,
  props?: Record<string, string | number | boolean | undefined>
) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, props || {});
  } catch {
    /* ignore */
  }
}

export function trackPage(path: string) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("config", GA_MEASUREMENT_ID, { page_path: path });
  } catch {
    /* ignore */
  }
}
