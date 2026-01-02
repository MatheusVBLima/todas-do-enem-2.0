"use client"

import * as React from "react"
import {
  BookOpen,
  GraduationCap,
  PenTool,
  Sparkles,
  FileText,
  ClipboardList,
  History,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

type UserPlan = 'TENTANDO_A_SORTE' | 'RUMO_A_APROVACAO'

interface AppUser {
  id: string
  email: string
  name: string
  plan: UserPlan
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: AppUser | null
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const isPaidUser = user ? user.plan === 'RUMO_A_APROVACAO' : false

  const ferramentas = [
    {
      title: "Questões",
      url: "/",
      icon: BookOpen,
    },
    {
      title: "Grupos",
      url: "/grupos",
      icon: ClipboardList,
    },
    {
      title: "Provas",
      url: "/provas",
      icon: FileText,
    },
    {
      title: "Redação",
      url: "/redacao",
      icon: PenTool,
      badge: isPaidUser ? undefined : "PRO",
    },
    {
      title: "Simulados",
      url: "/simulados",
      icon: History,
    },
  ]

  const plataforma = [
    {
      title: "Planos",
      url: "/planos",
      icon: Sparkles,
    },
  ]

  const userData = user ? {
    name: user.name,
    email: user.email,
    avatar: "", // Empty string will use fallback with initials
    plan: isPaidUser ? "Rumo à Aprovação" : "Tentando a Sorte",
  } : {
    name: "Visitante",
    email: "Faça login para acessar todas as funcionalidades",
    avatar: "", // Empty string will use fallback
    plan: null,
  }

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <GraduationCap className="size-6 text-primary" />
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">Todas do ENEM</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={ferramentas} userId={user?.id ?? null} groupLabel="Ferramentas" />
        <NavMain items={plataforma} userId={user?.id ?? null} groupLabel="Plataforma" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
