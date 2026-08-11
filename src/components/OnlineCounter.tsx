"use client";

import { useState, useEffect } from "react";
import { PulseDot, SpinLoader } from "@/components/StatLoader";

function getDeviceId(): string {
  try {
    let id = localStorage.getItem("tokenshit_device_id");
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "x-" + Math.random().toString(36).slice(2);
      localStorage.setItem("tokenshit_device_id", id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

export default function OnlineCounter() {
  const [online, setOnline] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deviceId = getDeviceId();

    const ping = () => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (typeof d.online === "number") setOnline(d.online);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-zinc-500"
      role="status"
      aria-label={loading ? "Loading online count" : `${online ?? 0} online`}
    >
      {loading ? (
        <>
          <SpinLoader size={10} />
          <span className="text-zinc-600">online</span>
        </>
      ) : (
        <>
          <PulseDot />
          <span>{online ?? 0} online</span>
        </>
      )}
    </span>
  );
}
