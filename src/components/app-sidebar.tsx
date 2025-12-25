"use client"

import * as React from "react"
import {
  BookOpen,
  FolderOpen,
  GraduationCap,
  PenTool,
  User,
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
import { getCurrentUser, hasPaidPlan } from "@/lib/dev-user"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = getCurrentUser()
  const isPaidUser = hasPaidPlan(user.plan)

  const navMain = [
    {
      title: "Estudo",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Questões",
          url: "/questoes",
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
      title: "Conta",
      url: "/conta",
      icon: User,
    },
  ]

  const userData = {
    name: user.name,
    email: user.email,
    avatar: "/avatars/user.jpg",
    plan: isPaidUser ? "Rumo à Aprovação" : "Tentando a Sorte",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
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
