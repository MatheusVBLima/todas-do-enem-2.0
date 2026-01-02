"use client"

import { useRouter } from "next/navigation"
import { FileQuestion, Home, FolderOpen } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SimuladoRedirectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SimuladoRedirectDialog({
  open,
  onOpenChange,
}: SimuladoRedirectDialogProps) {
  const router = useRouter()

  const handleGoToQuestions = () => {
    onOpenChange(false)
    router.push("/")
  }

  const handleGoToGroups = () => {
    onOpenChange(false)
    router.push("/grupos")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="size-5 text-primary" />
            Como criar um Simulado
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              Para criar um simulado, você precisa primeiro <strong>filtrar as questões</strong> que deseja incluir.
            </p>
            <p>
              Vá para a página de <strong>Questões</strong> ou acesse um dos seus <strong>Grupos de Estudo</strong> e aplique os filtros desejados (ano, área, disciplina, etc.).
            </p>
            <p>
              Depois, clique em <strong>"Novo Simulado"</strong> novamente para criar um simulado com as questões filtradas.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleGoToGroups}
            className="w-full sm:w-auto"
          >
            <FolderOpen className="size-4 mr-2" />
            Ir para Grupos
          </Button>
          <Button
            onClick={handleGoToQuestions}
            className="w-full sm:w-auto"
          >
            <Home className="size-4 mr-2" />
            Ir para Questões
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
