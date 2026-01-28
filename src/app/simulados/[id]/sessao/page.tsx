import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { redirect, notFound } from "next/navigation"
import { getSimuladoSession } from "@/server/actions/simulados"
import { SimuladoSessionClient } from "./simulado-session-client"
import { SimuladoSessionSkeleton } from "@/components/simulado/simulado-skeleton"
import { queryKeys } from "@/lib/query-keys"
import { getCurrentUser } from "@/lib/auth/server"
import type { Metadata } from "next"

interface SessionPageProps {
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
  const result = await getSimuladoSession(id)

  if (!result.success || !result.data) {
    return {
      title: "Simulado | Todas do ENEM",
    }
  }

  return {
    title: `${result.data.name} | Simulado - Todas do ENEM`,
    description: `Simulado com ${result.data.totalQuestions} questões`,
  }
}

async function SessionData({ id }: { id: string }) {
  // Verify user is authenticated
  const user = await getCurrentUser()
  if (!user) {
    redirect("/")
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })

  // Fetch session once - fetchQuery returns data AND populates cache (no duplicate call)
  const result = await queryClient.fetchQuery({
    queryKey: queryKeys.simulados.session(id),
    queryFn: () => getSimuladoSession(id),
  })

  if (!result.success || !result.data) {
    notFound()
  }

  // Check if simulado belongs to user
  if (result.data.userId !== user.id) {
    redirect("/simulados")
  }

  // If simulado is already completed, redirect to results
  if (result.data.status === "CONCLUIDO") {
    redirect(`/simulados/${id}`)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SimuladoSessionClient simuladoId={id} />
    </HydrationBoundary>
  )
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<SimuladoSessionSkeleton />}>
      <SessionData id={id} />
    </Suspense>
  )
}
