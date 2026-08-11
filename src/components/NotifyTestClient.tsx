"use client";

import { useEffect, useState } from "react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showLocalNotification,
  scheduleDropReminder,
  clearDropReminder,
  isDropReminderArmed,
} from "@/lib/notifications";

export default function NotifyTestClient() {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const [armed, setArmed] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setPerm(getNotificationPermission());
    setArmed(isDropReminderArmed());
  }, []);

  async function enable() {
    setMsg(null);
    const p = await requestNotificationPermission();
    setPerm(p);
    if (p === "granted") {
      setMsg("Permission granted");
      await showLocalNotification({
        title: "TOKENSHIT",
        body: "Notifications locked in. We'll ping on treasury drop.",
        url: "/claim",
        tag: "tokenshit-welcome",
      });
    } else {
      setMsg(`Permission: ${p}`);
    }
  }

  async function testNow() {
    setMsg(null);
    try {
      await showLocalNotification({
        title: "TEST · TOKENSHIT",
        body: "If you see this, notifications work.",
        url: "/test",
        tag: "tokenshit-test",
      });
      setMsg("Fired test notification");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }

  async function armDrop() {
    setMsg(null);
    try {
      await scheduleDropReminder();
      setArmed(true);
      setMsg("Drop reminder armed (fires near 00:00 UTC while app can run timers)");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }

  function disarm() {
    clearDropReminder();
    setArmed(false);
    setMsg("Drop reminder cleared");
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-sm text-zinc-400">
        Permission:{" "}
        <span className="font-mono text-neon">{perm}</span>
        {armed && (
          <span className="ml-2 text-xs text-zinc-500">· drop reminder on</span>
        )}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={enable}
          className="min-h-11 rounded-lg bg-neon text-black text-sm font-semibold"
        >
          Enable notifications
        </button>
        <button
          type="button"
          onClick={testNow}
          className="min-h-11 rounded-lg border border-zinc-600 text-sm font-semibold hover:border-neon"
        >
          Send test ping
        </button>
        <button
          type="button"
          onClick={armDrop}
          className="min-h-11 rounded-lg border border-zinc-600 text-sm font-semibold hover:border-neon"
        >
          Arm UTC-0 drop reminder
        </button>
        <button
          type="button"
          onClick={disarm}
          className="min-h-11 rounded-lg border border-zinc-700 text-sm text-zinc-400"
        >
          Clear reminder
        </button>
      </div>
      {msg && <p className="text-xs text-zinc-500 font-mono">{msg}</p>}
    </div>
  );
}
