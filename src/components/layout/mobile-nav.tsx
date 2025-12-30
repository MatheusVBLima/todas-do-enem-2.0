"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  FolderOpen,
  FileText,
  User,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const navigation = [
  {
    name: "Questões",
    href: "/questoes",
    icon: BookOpen,
  },
  {
    name: "Grupos",
    href: "/grupos",
    icon: FolderOpen,
  },
  {
    name: "Redação",
    href: "/redacao",
    icon: FileText,
    requiresPlan: true,
  },
  {
    name: "Conta",
    href: "/conta",
    icon: User,
  },
]

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: {
    name?: string | null
    plan?: "TENTANDO_A_SORTE" | "RUMO_A_APROVACAO" | null
  }
}

export function MobileNav({ open, onOpenChange, user }: MobileNavProps) {
  const pathname = usePathname()
  const userName = user?.name || "Visitante"
  const userPlan = user?.plan || "TENTANDO_A_SORTE"
  const isPaidUser = userPlan === "RUMO_A_APROVACAO"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            Todas do ENEM
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const isLocked = item.requiresPlan && !isPaidUser

              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start gap-3 h-10",
                    isLocked && "opacity-60"
                  )}
                  asChild
                  onClick={() => onOpenChange(false)}
                >
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    {item.name}
                    {isLocked && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        PRO
                      </Badge>
                    )}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="border-t p-4">
      <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
          {userName.charAt(0) ?? "U"}
            </div>
            <div className="flex flex-col">
          <span className="text-sm font-medium">{userName}</span>
              <span className="text-xs text-muted-foreground">
            {isPaidUser ? "Rumo à Aprovação" : "Tentando a Sorte"}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
