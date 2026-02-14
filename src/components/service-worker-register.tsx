"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      console.log("SW registered:", registration);

      // Check for updates immediately
      registration.update();

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log("🔄 New SW installed, reloading…");

            if (refreshing) return;
            refreshing = true;

            window.location.reload();
          }
        });
      });

      // Periodically check for updates (every 5 minutes)
      setInterval(
        () => {
          registration.update();
        },
        5 * 60 * 1000,
      );
    });

    // Handle controller change (when new SW takes control)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("🔄 SW controller changed, reloading page");
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  return null;
}
