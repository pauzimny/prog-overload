"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      console.log("SW registered:", registration);

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
    });
  }, []);

  return null;
}
