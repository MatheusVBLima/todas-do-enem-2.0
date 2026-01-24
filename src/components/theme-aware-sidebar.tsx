"use client"

import { useAppearance } from "@/hooks/use-appearance"
import { AppSidebar } from "@/components/app-sidebar"
import type { AppUser } from "@/components/app-sidebar"

interface ThemeAwareSidebarProps {
  user: AppUser | null
}

export function ThemeAwareSidebar({ user }: ThemeAwareSidebarProps) {
  // Este hook causa um re-render quando o tema muda
  const { settings } = useAppearance()

  // Retornamos null enquanto não está mounted para evitar flash
  return <AppSidebar user={user} />
}
