"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Download, FileText, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CompetenceBar } from "./competence-bar"
import { EssayEditor } from "./essay-editor"
import type { EssayWithCorrection } from "@/server/actions/essays"
import { getEssay } from "@/server/actions/essays"
import { queryKeys } from "@/lib/query-keys"
import Link from "next/link"

interface EssayCorrectionProps {
  essay: EssayWithCorrection
  userId: string
}

const COMPETENCE_LABELS = [
  "Domínio da modalidade escrita formal da língua portuguesa",
  "Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento",
  "Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos",
  "Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação",
  "Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos",
]

export function EssayCorrection({ essay: initialEssay, userId }: EssayCorrectionProps) {
  const queryClient = useQueryClient()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Use React Query with refetchInterval for polling
  const { data: essay = initialEssay } = useQuery({
    queryKey: queryKeys.essays.detail(initialEssay.id),
    queryFn: async () => {
      const result = await getEssay(initialEssay.id)
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch essay")
      }
      return result.data
    },
    initialData: initialEssay,
    // Poll every 5 seconds only when status is SUBMITTED
    refetchInterval: (query) => {
      const data = query.state.data
      return data?.status === "SUBMITTED" ? 5000 : false
    },
    // Keep polling even when window is not focused
    refetchIntervalInBackground: true,
  })

  // Show skeleton during correction
  if (essay.status === "SUBMITTED") {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>

        <Separator />

        {/* Loading message */}
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 size-12 animate-pulse rounded-full bg-primary/10" />
            <h3 className="mb-2 text-lg font-semibold">IA corrigindo sua redação...</h3>
            <p className="text-sm text-muted-foreground">
              Isso pode levar alguns minutos. A página será atualizada automaticamente.
            </p>
          </CardContent>
        </Card>

        {/* Competences skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!essay.correction) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <FileText className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">Correção não disponível</h3>
        <p className="text-sm text-muted-foreground">
          Esta redação ainda não foi corrigida
        </p>
      </div>
    )
  }

  const correction = essay.correction

  // Color for total score
  const getTotalScoreColor = (score: number) => {
    if (score >= 800) return "text-green-600 dark:text-green-400"
    if (score >= 600) return "text-yellow-600 dark:text-yellow-400"
    if (score >= 400) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <Link href="/redacao">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{essay.title}</h1>
              <p className="text-muted-foreground">{essay.theme}</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Nota Total</p>
          <p className={`text-5xl font-bold ${getTotalScoreColor(correction.totalScore)}`}>
            {correction.totalScore}
            <span className="text-2xl text-muted-foreground">/1000</span>
          </p>
        </div>
      </div>

      <Separator />

      {/* Essay text */}
      <Card>
        <CardHeader>
          <CardTitle>Texto da Redação</CardTitle>
          <CardDescription>
            {essay.wordCount} palavras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap font-serif text-base leading-relaxed">
            {essay.content}
          </div>
        </CardContent>
      </Card>

      {/* General feedback */}
      {correction.generalFeedback && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {correction.generalFeedback}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Competences */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Avaliação por Competência</h2>

        <div className="grid gap-4">
          <CompetenceBar
            number={1}
            label={COMPETENCE_LABELS[0]}
            score={correction.competence1Score}
            feedback={correction.competence1Feedback}
          />
          <CompetenceBar
            number={2}
            label={COMPETENCE_LABELS[1]}
            score={correction.competence2Score}
            feedback={correction.competence2Feedback}
          />
          <CompetenceBar
            number={3}
            label={COMPETENCE_LABELS[2]}
            score={correction.competence3Score}
            feedback={correction.competence3Feedback}
          />
          <CompetenceBar
            number={4}
            label={COMPETENCE_LABELS[3]}
            score={correction.competence4Score}
            feedback={correction.competence4Feedback}
          />
          <CompetenceBar
            number={5}
            label={COMPETENCE_LABELS[4]}
            score={correction.competence5Score}
            feedback={correction.competence5Feedback}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/redacao">
            <ArrowLeft className="mr-2 size-4" />
            Voltar para Redações
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit className="mr-2 size-4" />
          Editar Redação
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            window.print()
          }}
        >
          <Download className="mr-2 size-4" />
          Exportar Correção
        </Button>
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Redação</DialogTitle>
          </DialogHeader>
          <EssayEditor
            userId={userId}
            essayId={essay.id}
            initialTitle={essay.title || ""}
            initialTheme={essay.theme || ""}
            initialContent={essay.content}
            onSaved={async () => {
              setIsEditDialogOpen(false)

              // Force immediate refetch to show updated status
              await queryClient.invalidateQueries({
                queryKey: queryKeys.essays.detail(essay.id),
              })
            }}
            onClose={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
