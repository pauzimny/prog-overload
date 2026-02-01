"use client";

import { useState, useCallback } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export function useAdminToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ message, type = "info" }: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, removeToast };
}
