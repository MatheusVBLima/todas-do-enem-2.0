"use client"

import { Megaphone } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdBannerProps {
  className?: string
}

export function AdBanner({ className }: AdBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Megaphone className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Espaço para anúncio</p>
          <p className="text-xs text-muted-foreground">
            Divulgue seu curso ou produto para estudantes do ENEM
          </p>
        </div>
      </div>
      <a
        href="mailto:contato@todasdoenem.com.br?subject=Quero anunciar no Todas do ENEM"
        className="shrink-0 text-xs font-medium text-primary hover:underline"
      >
        contato@todasdoenem.com.br
      </a>
    </div>
  )
}
