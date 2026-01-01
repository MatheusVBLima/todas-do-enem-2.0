"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { FileText, Trash2, Eye, Edit, Clock, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { deleteEssay } from "@/server/actions/essays"
import type { EssayWithCorrection } from "@/server/actions/essays"
import { useQueryClient } from "@tanstack/react-query"
import { usePrefetchEssay } from "@/hooks/use-prefetch-essay"

interface EssayListProps {
  essays: EssayWithCorrection[]
  onEdit?: (essayId: string) => void
}

export function EssayList({ essays, onEdit }: EssayListProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const prefetchEssay = usePrefetchEssay()
  const [essayToDelete, setEssayToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="secondary" className="gap-1">
            <Edit className="size-3" />
            Rascunho
          </Badge>
        )
      case "SUBMITTED":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="size-3" />
            Enviada
          </Badge>
        )
      case "CORRECTED":
        return (
          <Badge className="gap-1">
            <CheckCircle2 className="size-3" />
            Corrigida
          </Badge>
        )
      default:
        return null
    }
  }

  const handleDelete = async () => {
    if (!essayToDelete) return

    setIsDeleting(true)

    try {
      const result = await deleteEssay(essayToDelete)

      if (result.success) {
        toast.success("Redação deletada com sucesso!")
        queryClient.invalidateQueries({ queryKey: ["essays"] })
      } else {
        toast.error(result.error || "Erro ao deletar redação")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Erro ao deletar redação")
    } finally {
      setIsDeleting(false)
      setEssayToDelete(null)
    }
  }

  if (essays.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Nenhuma redação criada</EmptyTitle>
          <EmptyDescription>
            Comece criando sua primeira redação para correção por IA
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      {/* Essays grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {essays.map((essay) => (
          <Card key={essay.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <CardTitle className="line-clamp-1 text-base">
                    {essay.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {essay.theme}
                  </CardDescription>
                </div>
                {getStatusBadge(essay.status)}
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              {essay.status === "SUBMITTED" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>IA corrigindo a redação...</span>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Palavras:</span>
                    <span className="font-medium">{essay.wordCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Atualizada:</span>
                    <span className="font-medium">
                      {format(new Date(essay.updatedAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  {essay.correction && (
                    <div className="flex items-center justify-between">
                      <span>Nota:</span>
                      <span className="font-bold text-primary">
                        {essay.correction.totalScore}/1000
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {essay.status === "DRAFT" ? (
                  <Button
                    onClick={() => onEdit?.(essay.id)}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <Edit className="mr-2 size-4" />
                    Editar
                  </Button>
                ) : (
                  <Button
                    asChild={essay.status === "CORRECTED"}
                    className="flex-1"
                    size="sm"
                    disabled={essay.status === "SUBMITTED"}
                  >
                    {essay.status === "CORRECTED" ? (
                      <Link
                        href={`/redacao/${essay.id}`}
                        onMouseEnter={() => {
                          prefetchEssay(essay.id)
                          router.prefetch(`/redacao/${essay.id}`)
                        }}
                      >
                        <Eye className="mr-2 size-4" />
                        Ver Correção
                      </Link>
                    ) : (
                      <>
                        <Eye className="mr-2 size-4" />
                        Ver Correção
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={() => setEssayToDelete(essay.id)}
                  variant="destructive"
                  size="sm"
                  disabled={essay.status === "SUBMITTED"}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!essayToDelete}
        onOpenChange={(open) => !open && setEssayToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar redação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A redação e sua correção (se houver)
              serão permanentemente deletadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
