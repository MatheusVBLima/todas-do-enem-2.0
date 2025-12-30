"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, LayoutGrid, Table2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { QuestionCard } from "./question-card"
import { QuestionsTable } from "./questions-table"
import { useQuestionFilters } from "@/hooks/use-question-filters"
import { getQuestions } from "@/server/actions/questions"
import { queryKeys } from "@/lib/query-keys"
import { useEffect, useState } from "react"

type QuestionListProps = {
  userId: string | null
  userPlan: string | null
}

export function QuestionList({ userId, userPlan }: QuestionListProps) {
  const [filters, setFilters] = useQuestionFilters()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  const { data, isPending, isFetching } = useQuery({
    queryKey: queryKeys.questions.list(filters),
    queryFn: () => getQuestions(filters),
    placeholderData: (previousData) => previousData,
    refetchOnMount: false,
  })

  const prefetchPage = (page: number) => {
    const targetFilters = { ...filters, pagina: page }
    queryClient.prefetchQuery({
      queryKey: queryKeys.questions.list(targetFilters),
      queryFn: () => getQuestions(targetFilters),
    })
  }

  // Prefetch next page when current page loads (keeps paginação adiante quente)
  useEffect(() => {
    if (data?.pagination.hasMore) {
      prefetchPage(filters.pagina + 1)
    }
  }, [data?.pagination.hasMore, filters.pagina])

  if (!data && isPending) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded bg-muted" />
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
              <div className="h-6 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-20 w-full animate-pulse rounded bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-12 w-full animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    const hasActiveFilters = filters.anos?.length > 0 || filters.areas?.length > 0 || filters.disciplinas?.length > 0 || filters.busca

    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Nenhuma questão encontrada</EmptyTitle>
          <EmptyDescription>
            {hasActiveFilters
              ? "Tente ajustar os filtros para encontrar mais questões."
              : "Não há questões disponíveis no momento."}
          </EmptyDescription>
        </EmptyHeader>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={() => setFilters({ anos: [], areas: [], disciplinas: [], busca: "", pagina: 1 })}
          >
            Limpar filtros
          </Button>
        )}
      </Empty>
    )
  }

  const { pagination } = data

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {data.data.length} de {pagination.total} questões
        </p>

        {/* View toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Questions */}
      {viewMode === "cards" ? (
        <div className="space-y-4">
          {data.data.map((question) => (
            <QuestionCard key={question.id} question={question} userId={userId} userPlan={userPlan} />
          ))}
        </div>
      ) : (
        <QuestionsTable
          questions={data.data}
          pagination={pagination}
          onPageChange={(page) => setFilters({ pagina: page })}
          isLoading={false}
          userId={userId}
        />
      )}

      {/* Pagination - Only show for cards view, table has its own */}
      {viewMode === "cards" && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setFilters({ pagina: pagination.page - 1 })}
            onMouseEnter={() => prefetchPage(pagination.page - 1)}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {generatePageNumbers(pagination.page, pagination.totalPages).map((page, idx) => (
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
              ) : (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => setFilters({ pagina: page as number })}
                  onMouseEnter={() => typeof page === "number" && prefetchPage(page)}
                >
                  {page}
                </Button>
              )
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasMore}
            onClick={() => setFilters({ pagina: pagination.page + 1 })}
            onMouseEnter={() => prefetchPage(pagination.page + 1)}
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
