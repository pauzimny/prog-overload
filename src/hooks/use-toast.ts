import { toast as sonnerToast } from 'sonner'

type ToastOptions = {
  message: string
  type?: 'success' | 'error' | 'info'
}

export function useToast() {
  const toast = ({ message, type = 'success' }: ToastOptions) => {
    if (type === 'success') sonnerToast.success(message)
    else if (type === 'error') sonnerToast.error(message)
    else sonnerToast.info(message)
  }

  return { toast }
}
