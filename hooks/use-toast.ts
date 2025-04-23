"use client"

import { useState } from "react"
import { ReactNode } from "react"

type ToastType = {
  id?: number
  title: string
  description?: string
  variant?: "default" | "destructive"
  action?: ReactNode
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const toast = ({ title, description, variant = "default", action }: ToastType) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, title, description, variant, action }])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  return { toast, toasts }
}
