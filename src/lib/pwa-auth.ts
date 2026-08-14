/** Detect installed PWA / standalone display modes (iOS + Android + desktop). */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const mq = window.matchMedia("(display-mode: standalone)").matches;
    const fullscreen = window.matchMedia("(display-mode: fullscreen)").matches;
    const minimal = window.matchMedia("(display-mode: minimal-ui)").matches;
    const ios = Boolean(
      (navigator as Navigator & { standalone?: boolean }).standalone
    );
    return mq || fullscreen || minimal || ios;
  } catch {
    return false;
  }
}

export function isAndroidUa(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|Seeker|SolanaMobile/i.test(navigator.userAgent || "");
}

/**
 * Seeker PWA + Android Chrome standalone cannot complete X popups.
 * Treat all Android / Seeker as needing the full-page login sheet.
 */
export function needsPwaOAuth(): boolean {
  return isStandalonePwa() || isAndroidUa();
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Where OAuth should land after X/GitHub — same origin, allowlisted in Privy. */
export function oauthReturnUrl(path = "/auth/oauth-return"): string {
  if (typeof window === "undefined") {
    return `https://tokenshit.com${path}`;
  }
  return `${window.location.origin}${path}`;
}

const RETURN_KEY = "tokenshit_oauth_return_v1";

export function stashOAuthReturnPath(path?: string) {
  try {
    const p =
      path ||
      `${window.location.pathname}${window.location.search}` ||
      "/";
    sessionStorage.setItem(RETURN_KEY, p.startsWith("/") ? p : "/");
  } catch {
    /* ignore */
  }
}

export function takeOAuthReturnPath(): string {
  try {
    const p = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    if (p && p.startsWith("/") && !p.startsWith("//")) return p;
  } catch {
    /* ignore */
  }
  return "/";
}
