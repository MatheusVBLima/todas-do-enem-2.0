"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Clock, FileQuestion, Play, AlertCircle, RotateCcw } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSimulado, refazerSimulado } from "@/server/actions/simulados"
import type { QuestionFilters, SimuladoSourceType } from "@/types"

interface SimuladoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  sourceGroupId?: string
  refazerSimuladoId?: string | null
}

const TIME_OPTIONS = [
  { value: "0", label: "Sem limite" },
  { value: "30", label: "30 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1 hora e 30 min" },
  { value: "120", label: "2 horas" },
  { value: "180", label: "3 horas" },
  { value: "240", label: "4 horas" },
  { value: "300", label: "5 horas" },
]

export function SimuladoDialog({
  open,
  onOpenChange,
  userId,
  sourceGroupId,
  refazerSimuladoId,
}: SimuladoDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [timeLimit, setTimeLimit] = useState("0")
  const [error, setError] = useState<string | null>(null)

  const isRefazer = !!refazerSimuladoId

  // Get current filters from URL
  const getCurrentFilters = (): QuestionFilters => {
    return {
      anos: searchParams.get("anos")?.split(",").map(Number).filter(Boolean) ?? [],
      areas: searchParams.get("areas")?.split(",").filter(Boolean) ?? [],
      disciplinas: searchParams.get("disciplinas")?.split(",").filter(Boolean) ?? [],
      busca: searchParams.get("busca") ?? "",
      pagina: 1, // Always start from first page for simulado
    }
  }

  // Determine source type based on current path
  const getSourceType = (): SimuladoSourceType => {
    if (pathname.startsWith("/grupos/") && sourceGroupId) {
      return "GROUP"
    }
    return "HOME"
  }

  const handleStart = () => {
    if (!userId) {
      setError("Você precisa estar logado para iniciar um simulado.")
      return
    }

    if (!name.trim()) {
      setError("Por favor, dê um nome ao seu simulado.")
      return
    }

    setError(null)

    startTransition(async () => {
      const timeLimitValue = parseInt(timeLimit) || undefined

      if (isRefazer && refazerSimuladoId) {
        // Refazer simulado com as mesmas questões
        const result = await refazerSimulado({
          userId,
          name: name.trim(),
          originalSimuladoId: refazerSimuladoId,
          timeLimit: timeLimitValue,
        })

        if (result.success && result.data) {
          onOpenChange(false)
          router.push(`/simulados/${result.data.id}/sessao`)
        } else {
          setError(result.error || "Erro ao refazer simulado. Tente novamente.")
        }
      } else {
        // Criar novo simulado com filtros da URL
        const filters = getCurrentFilters()
        const sourceType = getSourceType()

        const result = await createSimulado({
          userId,
          name: name.trim(),
          filters,
          timeLimit: timeLimitValue,
          sourceType,
          sourceGroupId: sourceType === "GROUP" ? sourceGroupId : undefined,
        })

        if (result.success && result.data) {
          onOpenChange(false)
          router.push(`/simulados/${result.data.id}/sessao`)
        } else {
          setError(result.error || "Erro ao criar simulado. Tente novamente.")
        }
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName("")
      setTimeLimit("0")
      setError(null)
    }
    onOpenChange(newOpen)
  }

  const filters = getCurrentFilters()
  const anos = filters.anos ?? []
  const areas = filters.areas ?? []
  const disciplinas = filters.disciplinas ?? []
  const hasFilters = anos.length > 0 || areas.length > 0 ||
                     disciplinas.length > 0 || filters.busca

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRefazer ? (
              <>
                <RotateCcw className="size-5 text-primary" />
                Refazer Simulado
              </>
            ) : (
              <>
                <FileQuestion className="size-5 text-primary" />
                Novo Simulado
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isRefazer ? (
              "Refaça o simulado com as mesmas questões. Suas respostas anteriores serão zeradas."
            ) : (
              <>
                Configure seu simulado com as questões filtradas na tela.
                {hasFilters && (
                  <span className="block mt-1 text-primary">
                    Filtros aplicados: {[
                      anos.length > 0 && `${anos.length} ano(s)`,
                      areas.length > 0 && `${areas.length} área(s)`,
                      disciplinas.length > 0 && `${disciplinas.length} disciplina(s)`,
                      filters.busca && "busca",
                    ].filter(Boolean).join(", ")}
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Simulado</Label>
            <Input
              id="name"
              placeholder={isRefazer ? "Ex: Tentativa 2 - Matemática" : "Ex: Revisão de Matemática 2024"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="size-4" />
              Tempo Limite
            </Label>
            <Select
              value={timeLimit}
              onValueChange={setTimeLimit}
              disabled={isPending}
            >
              <SelectTrigger id="time">
                <SelectValue placeholder="Selecione o tempo" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="size-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleStart} disabled={isPending}>
            {isPending ? (
              isRefazer ? "Refazendo..." : "Criando..."
            ) : (
              <>
                {isRefazer ? (
                  <RotateCcw className="size-4 mr-2" />
                ) : (
                  <Play className="size-4 mr-2" />
                )}
                {isRefazer ? "Refazer Simulado" : "Iniciar Simulado"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
