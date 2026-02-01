import { useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Toast } from "@/hooks/use-toast"

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

export function ToastComponent({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500", 
    info: "bg-blue-500"
  }[toast.type || 'success']

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-md shadow-lg flex items-center justify-between min-w-[250px] max-w-md animate-in slide-in-from-top-2`}>
      <span className="text-sm font-medium">{toast.message}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(toast.id)}
        className="text-white hover:bg-white/20 h-auto p-1 ml-2"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
