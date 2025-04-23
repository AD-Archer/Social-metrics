"use client"

import { useState } from "react"

type ToastType = {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const toast = ({ title, description, variant = "default" }: ToastType) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { title, description, variant }])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((_, i) => i !== 0))
    }, 5000)
  }

  return { toast, toasts }
}
