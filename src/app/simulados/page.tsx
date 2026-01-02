import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { redirect } from "next/navigation"
import { History } from "lucide-react"
import { getSimulados } from "@/server/actions/simulados"
import { SimuladoHistoryClient } from "./simulado-history-client"
import { SimuladoHistorySkeleton } from "@/components/simulado/simulado-skeleton"
import { queryKeys } from "@/lib/query-keys"
import { getCurrentUser } from "@/lib/auth/server"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Histórico de Simulados | Todas do ENEM",
  description: "Veja seu histórico de simulados realizados",
}

interface PageProps {
  searchParams: Promise<{
    pagina?: string
  }>
}

async function HistoryData({ userId, page }: { userId: string; page: number }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 30, // 30 minutos
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })

  // Server-side prefetch
  await queryClient.prefetchQuery({
    queryKey: queryKeys.simulados.list(userId),
    queryFn: () => getSimulados(userId, page),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SimuladoHistoryClient userId={userId} initialPage={page} />
    </HydrationBoundary>
  )
}

export default async function SimuladosPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const params = await searchParams
  const page = params.pagina ? parseInt(params.pagina) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Histórico de Simulados</h1>
      </div>

      <p className="text-muted-foreground">
        Acompanhe seu desempenho em todos os simulados realizados.
      </p>

      <Suspense fallback={<SimuladoHistorySkeleton />}>
        <HistoryData userId={user.id} page={page} />
      </Suspense>
    </div>
  )
}
