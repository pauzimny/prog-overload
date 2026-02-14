/* PWA Service Worker for Progressive Overload */

const STATIC_CACHE = "static-v8";
const RUNTIME_CACHE = "runtime-v8";

const STATIC_ASSETS = [
  "/manifest.json",
  "/_next/static/css/",
  "/_next/static/js/",
];

// Only cache static assets, not dynamic content
self.addEventListener("install", (event) => {
  console.log("SW: Installing service worker");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("SW: Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("SW: Activating service worker");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
            console.log("SW: Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Skip caching for API routes, admin routes, and dynamic content
  if (
    request.url.includes("/api/") ||
    request.url.includes("/_next/data/") ||
    request.url.includes("auth") ||
    request.url.includes("/admin")
  ) {
    console.log("SW: Skipping cache for:", request.url);
    event.respondWith(fetch(request));
    return;
  }

  // For navigation requests, always try network first (but don't cache admin pages)
  if (request.mode === "navigate") {
    if (request.url.includes("/admin")) {
      // Never cache admin pages - always fetch from network
      console.log("SW: Admin navigation - fetching from network:", request.url);
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
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response("Offline", { status: 503 });
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
