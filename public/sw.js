/* TOKENSHIT service worker v5 — never serve stale HTML/JS pair */
const CACHE = "tokenshit-v5";
const PRECACHE = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/splash/splash-boot.png",
  "/brand/logo-square.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache auth
  if (url.pathname.startsWith("/auth/") || url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  // HTML navigations: ALWAYS network-first. Stale HTML + new chunk hashes = white screen.
  const isHtml =
    req.mode === "navigate" ||
    req.headers.get("accept")?.includes("text/html");
  if (isHtml) {
    event.respondWith(
      fetch(req)
        .then((res) => res)
        .catch(() =>
          // Offline: only icons shell, not a stale full document
          caches.match("/splash/splash-boot.png").then(() =>
            new Response(
              `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1">
              <body style="margin:0;background:#0a0a0f;color:#fff8e7;font-family:system-ui;display:grid;place-items:center;min-height:100dvh;text-align:center;padding:24px">
              <div><div style="font-size:28px;letter-spacing:.05em">TOKEN$HIT</div>
              <p style="color:#a1a1aa;font-size:14px">Offline — reconnect and reload.</p>
              <button onclick="location.reload()" style="margin-top:16px;padding:12px 20px;border-radius:12px;border:0;background:#39ff14;color:#000;font-weight:700">Reload</button></div></body>`,
              { headers: { "Content-Type": "text/html; charset=utf-8" } }
            )
          )
        )
    );
    return;
  }

  // Next.js bundles: network-first (hashed URLs). Cache only as offline fallback.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Icons / brand / fonts: cache-first OK (immutable paths)
  const isAsset =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/splash/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webmanifest") ||
    url.pathname.endsWith(".woff2");

  if (isAsset) {
    event.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req)
          .then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE).then((c) => c.put(req, clone));
            }
            return res;
          })
          .catch(() => hit);
        return hit || net;
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data || {};
  const target = typeof raw.url === "string" ? raw.url : "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if ("focus" in client) {
            client.navigate(target);
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
      })
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SHOW_NOTIFICATION") {
    const title = data.title || "TOKEN$HIT";
    const options = {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || "tokenshit",
      renotify: Boolean(data.renotify),
      data: { url: data.url || "/" },
      vibrate: data.vibrate || [80, 40, 80],
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (data.type === "CLEAR_CACHES") {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
  }
});
