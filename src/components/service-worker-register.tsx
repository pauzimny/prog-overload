"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Register only — no forced reloads.
    // On iOS PWA (standalone mode), calling window.location.reload() can
    // break out of the standalone context into regular Safari, which has
    // separate localStorage, causing the Supabase session to be lost.
    // The browser naturally picks up SW updates on the next navigation.
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("SW registration failed:", error);
    });
  }, []);

  return null;
}
