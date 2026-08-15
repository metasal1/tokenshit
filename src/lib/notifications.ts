/**
 * Browser notifications + drop reminder helpers.
 * Uses SW when available so clicks open the right route.
 */

const DROP_KEY = "tokenshit_drop_reminder_v1";
const ARM_KEY = "tokenshit_drop_armed";

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function ensureSw(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js?v=6", {
      scope: "/",
      updateViaCache: "none",
    });
    try {
      await reg.update();
    } catch {
      /* ignore */
    }
    await navigator.serviceWorker.ready;
    return reg;
  } catch {
    return null;
  }
}

export async function showLocalNotification(opts: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}): Promise<void> {
  const perm = getNotificationPermission();
  if (perm === "unsupported") throw new Error("Notifications unsupported");
  if (perm !== "granted") {
    const p = await requestNotificationPermission();
    if (p !== "granted") throw new Error("Permission not granted");
  }

  const reg = await ensureSw();
  if (reg?.active) {
    reg.active.postMessage({
      type: "SHOW_NOTIFICATION",
      title: opts.title,
      body: opts.body,
      url: opts.url || "/",
      tag: opts.tag || "tokenshit",
      renotify: true,
    });
    return;
  }

  // Fallback without SW
  // eslint-disable-next-line no-new
  new Notification(opts.title, {
    body: opts.body,
    icon: "/icons/icon-192.png",
    tag: opts.tag || "tokenshit",
    data: { url: opts.url || "/" },
  });
}

function nextUtcMidnightMs(from = Date.now()): number {
  const d = new Date(from);
  d.setUTCHours(0, 0, 0, 0);
  if (d.getTime() <= from) d.setUTCDate(d.getUTCDate() + 1);
  return d.getTime();
}

/** Arm a setTimeout chain for next UTC midnight (works while page/SW alive). */
export async function scheduleDropReminder(): Promise<void> {
  const perm = await requestNotificationPermission();
  if (perm !== "granted") throw new Error("Enable notifications first");

  if (typeof window === "undefined") return;
  window.localStorage.setItem(ARM_KEY, "1");

  const fireAt = nextUtcMidnightMs();
  const delay = Math.max(1000, fireAt - Date.now());
  // Cap setTimeout (~24.8d max anyway); we only need ≤24h
  window.localStorage.setItem(DROP_KEY, String(fireAt));

  window.setTimeout(async () => {
    if (window.localStorage.getItem(ARM_KEY) !== "1") return;
    await showLocalNotification({
      title: "TREASURY RELOADED",
      body: "+1,000,000 $TOKENSHIT dropped · claim / vote",
      url: "/claim",
      tag: "tokenshit-drop",
    });
    // re-arm next day if still enabled
    if (window.localStorage.getItem(ARM_KEY) === "1") {
      void scheduleDropReminder();
    }
  }, Math.min(delay, 2147483647));
}

export function clearDropReminder() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ARM_KEY);
  window.localStorage.removeItem(DROP_KEY);
}

export function isDropReminderArmed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ARM_KEY) === "1";
}

/** Call on app boot — re-schedule if armed */
export function resumeDropReminderIfArmed() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(ARM_KEY) !== "1") return;
  if (getNotificationPermission() !== "granted") return;
  void scheduleDropReminder().catch(() => {});
}
