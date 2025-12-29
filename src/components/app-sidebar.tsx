"use client"

import * as React from "react"
import {
  BookOpen,
  GraduationCap,
  PenTool,
  Sparkles,
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

  const navMain = [
    {
      title: "Estudo",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Questões",
          url: "/",
        },
        {
          title: "Grupos",
          url: "/grupos",
        },
      ],
    },
    {
      title: "Redação",
      url: "/redacao",
      icon: PenTool,
      badge: isPaidUser ? undefined : "PRO",
    },
    {
      title: "Planos",
      url: "/planos",
      icon: Sparkles,
    },
  ]

  const userData = user ? {
    name: user.name,
    email: user.email,
    avatar: "/avatars/user.jpg",
    plan: isPaidUser ? "Rumo à Aprovação" : "Tentando a Sorte",
  } : {
    name: "Visitante",
    email: "Faça login para acessar todas as funcionalidades",
    avatar: "/avatars/guest.jpg",
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
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
