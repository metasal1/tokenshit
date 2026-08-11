/* TOKENSHIT service worker — cache shell + notification click */
const CACHE = "tokenshit-v1";
const PRECACHE = [
  "/",
  "/claim",
  "/test",
  "/brand",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
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

  // Network-first for pages/API; cache-first for icons/static
  const isStatic =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webmanifest");

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((hit) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE).then((c) => c.put(req, clone));
            }
            return res;
          })
          .catch(() => hit);
        return hit || fetchPromise;
      })
    );
    return;
  }

  // HTML / app routes — network first, fall back to cache
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req).then((h) => h || caches.match("/")))
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data || {};
  const target = typeof raw.url === "string" ? raw.url : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
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
    const title = data.title || "TOKENSHIT";
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
});
