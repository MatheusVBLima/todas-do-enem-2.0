"use client"

import { useState, useMemo } from "react"
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

const TABLE_PAGE_SIZE = 10

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
  isLoading?: boolean
  userId: string | null
}

export function QuestionsTable({
  questions,
  pagination,
  onPageChange,
  isLoading,
  userId,
}: QuestionsTableProps) {
  const router = useRouter()
  const prefetchQuestion = usePrefetchQuestion()
  const [tablePage, setTablePage] = useState(1)

  // Internal pagination for the table (max 10 items per page)
  const tablePageCount = Math.ceil(questions.length / TABLE_PAGE_SIZE)
  const paginatedQuestions = useMemo(() => {
    const start = (tablePage - 1) * TABLE_PAGE_SIZE
    return questions.slice(start, start + TABLE_PAGE_SIZE)
  }, [questions, tablePage])

  // Reset table page when questions change
  useMemo(() => {
    setTablePage(1)
  }, [pagination.page])

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
            {paginatedQuestions.map((question) => (
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

      {/* Internal Table Pagination */}
      {tablePageCount > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {tablePage} de {tablePageCount} ({questions.length} questões nesta página)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={tablePage <= 1}
              onClick={() => setTablePage(tablePage - 1)}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, tablePageCount) }, (_, i) => {
                let pageNum: number

                if (tablePageCount <= 5) {
                  pageNum = i + 1
                } else if (tablePage <= 3) {
                  pageNum = i + 1
                } else if (tablePage >= tablePageCount - 2) {
                  pageNum = tablePageCount - 4 + i
                } else {
                  pageNum = tablePage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={tablePage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTablePage(pageNum)}
                    className="min-w-9"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={tablePage >= tablePageCount}
              onClick={() => setTablePage(tablePage + 1)}
            >
              Próxima
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
