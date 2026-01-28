import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { redirect, notFound } from "next/navigation"
import { ClipboardList } from "lucide-react"
import { getSimuladoResult } from "@/server/actions/simulados"
import { SimuladoResultClient } from "./simulado-result-client"
import { SimuladoResultSkeleton } from "@/components/simulado/simulado-skeleton"
import { queryKeys } from "@/lib/query-keys"
import { getCurrentUser } from "@/lib/auth/server"
import type { Metadata } from "next"

interface ResultPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const result = await getSimuladoResult(id)

  if (!result.success || !result.data) {
    return {
      title: "Resultado | Todas do ENEM",
    }
  }

  return {
    title: `Resultado: ${result.data.name} | Todas do ENEM`,
    description: `Resultado do simulado com ${result.data.totalQuestions} questões`,
  }
}

async function ResultData({ id }: { id: string }) {
  // Verify user is authenticated
  const user = await getCurrentUser()
  if (!user) {
    redirect("/")
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })

  // Fetch result once - fetchQuery returns data AND populates cache (no duplicate call)
  const result = await queryClient.fetchQuery({
    queryKey: queryKeys.simulados.result(id),
    queryFn: () => getSimuladoResult(id),
  })

  if (!result.success || !result.data) {
    notFound()
  }

  // Check if simulado belongs to user
  if (result.data.userId !== user.id) {
    redirect("/simulados")
  }

  // If simulado is still in progress, redirect to session
  if (result.data.status === "EM_ANDAMENTO") {
    redirect(`/simulados/${id}/sessao`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Resultado do Simulado</h1>
      </div>

      <p className="text-muted-foreground">
        Analise seu desempenho detalhado e revise as questões que errou.
      </p>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <SimuladoResultClient simuladoId={id} />
      </HydrationBoundary>
    </div>
  )
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<SimuladoResultSkeleton />}>
      <ResultData id={id} />
    </Suspense>
  )
}
