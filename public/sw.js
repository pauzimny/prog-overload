/* PWA Service Worker for Progressive Overload */

const STATIC_CACHE = "static-v6";
const RUNTIME_CACHE = "runtime-v6";

const STATIC_ASSETS = [
  "/manifest.json",
  "/_next/static/css/",
  "/_next/static/js/",
];

// Only cache static assets, not dynamic content
self.addEventListener("install", (event) => {
  console.log("SW: Installing service worker");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("SW: Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error("SW: Install failed:", error);
      }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activating service worker");
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        const oldKeys = keys.filter(
          (key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE,
        );
        console.log("SW: Deleting old caches:", oldKeys);
        return Promise.all(oldKeys.map((key) => caches.delete(key)));
      })
      .then(() => self.clients.claim())
      .catch((error) => {
        console.error("SW: Activation failed:", error);
      }),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip caching for API routes, admin routes, and dynamic content
  if (
    request.url.includes("/api/") ||
    request.url.includes("/_next/data/") ||
    request.url.includes("auth") ||
    request.url.includes("/admin")
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // For navigation requests, always try network first (but don't cache admin pages)
  if (request.mode === "navigate") {
    if (request.url.includes("/admin")) {
      // Never cache admin pages - always fetch from network
      event.respondWith(fetch(request));
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses for non-admin pages
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch((error) => {
          console.error("SW: Navigation fetch failed:", error);
          return caches.match(request);
        }),
    );
    return;
  }

  // For static assets, try cache first with network fallback
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "manifest"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          console.log("SW: Serving from cache:", request.url);
          return cached;
        }

        // If not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              console.log("SW: Caching new asset:", request.url);
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, copy);
              });
            }
            return response;
          })
          .catch((error) => {
            console.error("SW: Asset fetch failed:", error);
            return new Response("Service Worker Error", { status: 500 });
          });
      }),
    );
    return;
  }

  // For everything else, try network first
  event.respondWith(
    fetch(request).catch((error) => {
      console.error("SW: Fetch failed, trying cache:", error);
      return caches.match(request);
    }),
  );
});
