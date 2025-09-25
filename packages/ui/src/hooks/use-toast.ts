import { useCallback, useState } from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...props, id }
    setToasts(prev => [...prev, newToast])
    return { id }
  }, [])

  const dismiss = useCallback((toastId?: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId))
  }, [])

  return { toast, dismiss, toasts }
}

export { toast } from './use-toast'
