"use client"

import { Megaphone } from "lucide-react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

function AdCardItem() {
  return (
    <div className="rounded-lg border border-dashed border-sidebar-border bg-sidebar-accent/50 px-4 py-5 tall:py-10 flex flex-col justify-center">
      <div className="flex items-center gap-2">
        <Megaphone className="size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs font-medium">Quer anunciar o seu negócio?</p>
      </div>
      <a
        href="mailto:contato@todasdoenem.com.br?subject=Quero anunciar no Todas do ENEM"
        className="mt-2 block text-xs text-muted-foreground hover:text-foreground hover:underline"
      >
        contato@todasdoenem.com.br
      </a>
    </div>
  )
}

export function AdCard() {
  return (
    <SidebarGroup>
      {/* Ícones visíveis apenas quando colapsado */}
      <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
        {[1, 2, 3].map((i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuButton asChild tooltip="Anuncie aqui">
              <a href="mailto:contato@todasdoenem.com.br?subject=Quero anunciar no Todas do ENEM">
                <Megaphone />
                <span>Anuncie aqui</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      {/* Cards visíveis apenas quando expandido */}
      <div className="flex flex-col gap-2 px-2 group-data-[collapsible=icon]:hidden">
        <AdCardItem />
        <AdCardItem />
        <AdCardItem />
      </div>
    </SidebarGroup>
  )
}
