"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          success: "!bg-emerald-50 !text-emerald-800 !border !border-emerald-300 dark:!bg-emerald-950/40 dark:!text-emerald-300 dark:!border-emerald-800 [&>[data-icon]]:text-emerald-600 dark:[&>[data-icon]]:text-emerald-400",
          error: "!bg-red-50 !text-red-800 !border !border-red-300 dark:!bg-red-950/40 dark:!text-red-300 dark:!border-red-800 [&>[data-icon]]:text-red-600 dark:[&>[data-icon]]:text-red-400",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
