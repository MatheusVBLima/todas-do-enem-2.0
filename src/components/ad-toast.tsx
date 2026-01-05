"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { Megaphone } from "lucide-react"

const AD_INTERVAL = 10 * 60 * 1000 // 10 minutos

export function AdToastProvider() {
  const hasShownInitial = useRef(false)

  useEffect(() => {
    // Mostra o primeiro toast após 2 minutos (para não ser intrusivo logo de cara)
    const initialDelay = 2 * 60 * 1000

    const showAdToast = () => {
      // Dismiss any existing ad toast before showing a new one
      toast.dismiss("ad-toast")

      toast(
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Quer anunciar aqui?</p>
            <p className="text-xs text-muted-foreground">
              Divulgue seu negócio para milhares de estudantes do ENEM.
            </p>
            <a
              href="mailto:contato@todasdoenem.com.br?subject=Quero anunciar no Todas do ENEM"
              className="inline-block text-xs text-primary hover:underline"
            >
              contato@todasdoenem.com.br
            </a>
          </div>
        </div>,
        {
          id: "ad-toast",
          duration: 10000,
          position: "bottom-right",
        }
      )
    }

    // Timer para o primeiro toast
    const initialTimer = setTimeout(() => {
      if (!hasShownInitial.current) {
        showAdToast()
        hasShownInitial.current = true
      }
    }, initialDelay)

    // Timer para toasts recorrentes a cada 10 minutos
    const intervalTimer = setInterval(() => {
      showAdToast()
    }, AD_INTERVAL)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(intervalTimer)
    }
  }, [])

  return null
}
