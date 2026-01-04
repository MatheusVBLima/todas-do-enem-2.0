"use client"

import { Megaphone } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

function AdCardItem() {
  return (
    <div className="flex-1 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 flex flex-col justify-center min-h-[108px]">
      <div className="flex items-center gap-2">
        <Megaphone className="size-4 shrink-0 text-primary" />
        <p className="text-xs font-medium">Quer anunciar o seu negócio?</p>
      </div>
      <a
        href="mailto:contato@todasdoenem.com.br?subject=Quero anunciar no Todas do ENEM"
        className="mt-2 block text-xs text-primary hover:underline"
      >
        contato@todasdoenem.com.br
      </a>
    </div>
  )
}

export function AdCard() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Quando a sidebar está colapsada, mostra apenas o ícone
  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-2 px-2 py-2">
        <a
          href="mailto:contato@todasdoenem.com.br?subject=Quero anunciar no Todas do ENEM"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-primary"
        >
          <Megaphone className="size-4" />
        </a>
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
    <div className="mx-2 flex flex-col gap-2">
      <AdCardItem />
      <AdCardItem />
    </div>
  )
}
