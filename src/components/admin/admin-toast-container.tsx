"use client";

import { useEffect } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AdminToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function AdminToastContainer({
  toasts,
  onRemove,
}: AdminToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg border transition-all transform translate-x-0 ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
              : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
                : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="ml-3 text-sm opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
