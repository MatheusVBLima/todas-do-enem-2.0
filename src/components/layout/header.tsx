"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { ClipboardList, RotateCcw } from "lucide-react"
import { GlobalSearch } from "@/components/search/global-search"
import { Button } from "@/components/ui/button"
import { SimuladoDialog } from "@/components/simulado/simulado-dialog"
import { SimuladoRedirectDialog } from "@/components/simulado/simulado-redirect-dialog"
import { useSimuladoContext } from "@/stores/use-simulado-context"

interface HeaderProps {
  userId?: string | null
}

// Páginas que permitem criar simulado (têm questões)
function canCreateSimulado(pathname: string, hasGroupContext: boolean): boolean {
  // Página raiz (questões)
  if (pathname === "/") return true
  // Página de grupo específico (via context)
  if (hasGroupContext) return true
  return false
}

// Verifica se está na página de resultado de simulado
function isSimuladoResultPage(pathname: string): boolean {
  // /simulados/[id] mas não /simulados/[id]/sessao
  const match = pathname.match(/^\/simulados\/([^/]+)$/)
  return match !== null && match[1] !== undefined
}

// Extrai o ID do simulado da URL
function getSimuladoIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/simulados\/([^/]+)$/)
  return match ? match[1] : null
}

export function Header({ userId = null }: HeaderProps) {
  const pathname = usePathname()
  const [simuladoDialogOpen, setSimuladoDialogOpen] = useState(false)
  const [redirectDialogOpen, setRedirectDialogOpen] = useState(false)

  // Get group context from Zustand store (set by GroupDetailClient)
  const { groupId } = useSimuladoContext()

  const canCreate = canCreateSimulado(pathname, !!groupId)
  const isResultPage = isSimuladoResultPage(pathname)
  const simuladoId = getSimuladoIdFromPath(pathname)

  const handleButtonClick = () => {
    if (canCreate || isResultPage) {
      setSimuladoDialogOpen(true)
    } else {
      setRedirectDialogOpen(true)
    }
  }

  // Texto e ícone do botão
  const buttonText = isResultPage ? "Refazer Simulado" : "Novo Simulado"
  const ButtonIcon = isResultPage ? RotateCcw : ClipboardList

  return (
    <>
      <div className="flex items-center gap-2">
        <GlobalSearch />
        <Button
          variant="outline"
          onClick={handleButtonClick}
          className="hidden sm:flex items-center gap-2"
        >
          <ButtonIcon className="size-4" />
          <span>{buttonText}</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleButtonClick}
          className="sm:hidden"
          aria-label={buttonText}
        >
          <ButtonIcon className="size-4" />
        </Button>
      </div>

      <SimuladoDialog
        open={simuladoDialogOpen}
        onOpenChange={setSimuladoDialogOpen}
        userId={userId}
        sourceGroupId={groupId ?? undefined}
        refazerSimuladoId={isResultPage ? simuladoId : undefined}
      />

      <SimuladoRedirectDialog
        open={redirectDialogOpen}
        onOpenChange={setRedirectDialogOpen}
      />
    </>
  )
}
