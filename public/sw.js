/* Safe Service Worker for Next.js PWA */

const STATIC_CACHE = "static-v1";

// ---------- INSTALL ----------
self.addEventListener("install", () => {
  // Activate new SW immediately
  self.skipWaiting();
});

// ---------- ACTIVATE ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Remove old caches
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE) {
              return caches.delete(cacheName);
            }
          }),
        ),
      ),
      // Take control of open tabs
      self.clients.claim(),
    ]),
  );
});

// ---------- FETCH ----------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Let browser handle non-GET requests
  if (request.method !== "GET") return;

  // Do NOT touch API or Next.js data requests
  if (request.url.includes("/api/") || request.url.includes("/_next/data/")) {
    return;
  }

  // 🚫 NEVER cache HTML / navigation requests
  if (request.mode === "navigate") {
    event.respondWith(fetch(request));
    return;
  }

  // Cache static assets only
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) {
            return cached;
          }

          return fetch(request)
            .then((response) => {
              // Cache only successful responses
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);
        }),
      ),
    );
  }
});
