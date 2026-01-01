"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react"
import { ProofGrid } from "@/components/proofs/proof-grid"
import { Button } from "@/components/ui/button"
import { useProofFilters } from "@/hooks/use-proof-filters"
import { getProofs } from "@/server/actions/proofs"
import { queryKeys } from "@/lib/query-keys"

export function ProofListContent() {
  const [filters, setFilters] = useProofFilters()

  const { data } = useSuspenseQuery({
    queryKey: queryKeys.proofs.list(filters),
    queryFn: () => getProofs(filters),
  })

  const { data: proofs, pagination } = data
  const { page, totalPages, hasMore } = pagination

  const setPage = (newPage: number) => {
    setFilters({ pagina: newPage })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (proofs.length === 0) {
    const hasActiveFilters = filters.anos.length > 0 || filters.tipo

    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card/30 rounded-xl border border-dashed border-border/50">
        <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
          <SearchX className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold mb-2">Nenhuma prova encontrada</h3>
        <p className="text-muted-foreground max-w-xs mx-auto">
          {hasActiveFilters 
            ? "Tente ajustar seus filtros para encontrar o que está procurando." 
            : "Não há provas disponíveis no momento."}
        </p>
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => setFilters({ anos: [], tipo: null, pagina: 1 })}
          >
            Limpar filtros
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Mostrando {proofs.length} de {pagination.total} provas
        </p>
      </div>

      <ProofGrid proofs={proofs} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-10 border-t border-border/50">
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="size-4 mr-2" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-1">
            {generatePageNumbers(page, totalPages).map((p, idx) => (
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
              ) : (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => setPage(p as number)}
                >
                  {p}
                </Button>
              )
            ))}
          </div>

          <Button
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
            variant="outline"
            size="sm"
          >
            Próxima
            <ChevronRight className="size-4 ml-2" />
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
