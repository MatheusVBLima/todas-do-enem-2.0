"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { QuestionCard } from "@/components/questions/question-card"
import { PDFExportButton } from "@/components/export/pdf-export-button"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getGroup, removeQuestionFromGroup } from "@/server/actions/groups"
import { toast } from "sonner"
import Link from "next/link"
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
import { useState } from "react"
import { queryKeys } from "@/lib/query-keys"

export function GroupDetailClient() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const groupId = params.id as string
  const [questionToRemove, setQuestionToRemove] = useState<string | null>(null)

  const { data: group, isLoading } = useQuery({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: async () => {
      const result = await getGroup(groupId)
      return result.success ? result.data : null
    },
  })

  const removeMutation = useMutation({
    mutationFn: (questionId: string) => removeQuestionFromGroup(groupId, questionId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
        toast.success("Questão removida do grupo!")
      } else {
        toast.error(result.error || "Erro ao remover questão")
      }
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <FolderOpen className="size-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Grupo não encontrado</h2>
        <p className="text-muted-foreground">Este grupo não existe ou foi deletado.</p>
        <Button onClick={() => router.push("/grupos")}>
          <ArrowLeft className="mr-2 size-4" />
          Voltar para Grupos
        </Button>
      </div>
    )
  }
  const questions = group.questions.map((q) => q.question)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/grupos")}>
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FolderOpen className="size-6" style={{ color: group.color }} />
            <h1 className="text-2xl font-bold">{group.name}</h1>
          </div>
          {group.description && (
            <p className="mt-1 text-muted-foreground">{group.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {group._count.questions} {group._count.questions === 1 ? "questão" : "questões"}
          </Badge>
          {questions.length > 0 && (
            <PDFExportButton
              questions={questions}
              filename={group.name}
              title={group.name}
            />
          )}
        </div>
      </div>

      {questions.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Nenhuma questão neste grupo</EmptyTitle>
            <EmptyDescription>
              Vá para a página de questões e adicione questões a este grupo
            </EmptyDescription>
          </EmptyHeader>
          <Link href="/">
            <Button>Ir para Questões</Button>
          </Link>
        </Empty>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onRemove={() => setQuestionToRemove(question.id)}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={!!questionToRemove}
        onOpenChange={(open) => !open && setQuestionToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover questão do grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta questão será removida do grupo "{group.name}", mas não será deletada do
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (questionToRemove) {
                  await removeMutation.mutateAsync(questionToRemove)
                  setQuestionToRemove(null)
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
