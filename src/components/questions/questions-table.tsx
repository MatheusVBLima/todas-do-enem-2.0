"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddToGroupButton } from "@/components/groups/add-to-group-button"
import { usePrefetchQuestion } from "@/hooks/use-prefetch-question"
import type { QuestionWithExam } from "@/types"

interface QuestionsTableProps {
  questions: QuestionWithExam[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore: boolean
  }
  onPageChange: (page: number) => void
  prefetchPage?: (page: number) => void
  isLoading?: boolean
  userId: string | null
}

export function QuestionsTable({
  questions,
  pagination,
  onPageChange,
  prefetchPage,
  isLoading,
  userId,
}: QuestionsTableProps) {
  const router = useRouter()
  const prefetchQuestion = usePrefetchQuestion()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma questão encontrada com os filtros selecionados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ano</TableHead>
              <TableHead className="w-[100px]">Número</TableHead>
              <TableHead>Área de Conhecimento</TableHead>
              <TableHead>Disciplina</TableHead>
              <TableHead className="w-[200px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <Badge variant="outline">{question.exam.year}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  #{question.questionNumber}
                </TableCell>
                <TableCell className="text-sm">
                  {question.knowledgeArea}
                </TableCell>
                <TableCell className="text-sm">
                  {question.subject}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <AddToGroupButton
                      questionId={question.id}
                      userId={userId}
                      variant="ghost"
                      size="sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      asChild
                    >
                      <Link
                        href={`/${question.id}`}
                        onMouseEnter={() => {
                          prefetchQuestion(question.id)
                          router.prefetch(`/${question.id}`)
                        }}
                      >
                        Ver
                        <ExternalLink className="size-3" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Navigate through Supabase pages */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            onMouseEnter={() => prefetchPage?.(pagination.page - 1)}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {generatePageNumbers(pagination.page, pagination.totalPages).map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
              ) : (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => onPageChange(page)}
                  onMouseEnter={() => typeof page === "number" && prefetchPage?.(page)}
                >
                  {page}
                </Button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasMore}
            onClick={() => onPageChange(pagination.page + 1)}
            onMouseEnter={() => prefetchPage?.(pagination.page + 1)}
          >
            Próxima
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, "...", total]
  }

  if (current >= total - 2) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, "...", current - 1, current, current + 1, "...", total]
}
