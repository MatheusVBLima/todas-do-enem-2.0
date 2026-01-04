"use client"

import { Megaphone } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

export function AdCard() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Quando a sidebar está colapsada, mostra apenas o ícone
  if (isCollapsed) {
    return (
      <div className="flex justify-center px-2 py-2">
        <a
          href="mailto:contato@todasdoenem.com.br?subject=Quero anunciar no Todas do ENEM"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-primary"
        >
          <Megaphone className="size-4" />
        </a>
      </div>
    )
  }

  return (
    <div className="mx-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
      <div className="flex items-start gap-2">
        <Megaphone className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="text-xs font-medium">Quer divulgar o seu negócio?</p>
          <p className="text-xs text-muted-foreground">
            Anuncie para milhares de estudantes do ENEM.
          </p>
          <a
            href="mailto:contato@todasdoenem.com.br?subject=Quero anunciar no Todas do ENEM"
            className="text-xs text-primary hover:underline"
          >
            contato@todasdoenem.com.br
          </a>
        </div>
      </div>
    </div>
  )
}
