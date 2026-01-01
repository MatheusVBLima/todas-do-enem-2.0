import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { ProofFilters } from "@/components/proofs/proof-filters"
import { ProofListContent } from "./proof-list-content"
import { getProofs } from "@/server/actions/proofs"
import { queryKeys } from "@/lib/query-keys"
import type { ProofFilters as ProofFiltersType } from "@/types"
import { FileText } from "lucide-react"

interface PageProps {
  searchParams: Promise<{
    anos?: string
    tipo?: string
    pagina?: string
  }>
}

export default async function ProvasPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Parse filters from URL
  const filters: ProofFiltersType = {
    anos: params.anos ? params.anos.split(",").map(Number) : [],
    tipo: params.tipo as any,
    pagina: params.pagina ? Number(params.pagina) : 1,
  }

  // Prefetch data on server
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: queryKeys.proofs.list(filters),
    queryFn: () => getProofs(filters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Provas do ENEM</h1>
        </div>

        <p className="text-muted-foreground">
          Acesse o maior acervo de provas do ENEM. Visualize online ou baixe os cadernos originais com gabarito.
        </p>

        <ProofFilters />

        {/* Main Content */}
        <main className="min-h-[600px]">
          <Suspense
            fallback={
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[280px] rounded-xl bg-card/50 border border-border/50 animate-pulse relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent" />
                  </div>
                ))}
              </div>
            }
          >
            <ProofListContent />
          </Suspense>
        </main>
      </div>
    </HydrationBoundary>
  )
}
