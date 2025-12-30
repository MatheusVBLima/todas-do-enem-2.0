import { Suspense } from "react"
import { FileText, Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { hasPaidPlan } from "@/lib/auth/permissions"
import { RedacaoClient } from "@/components/redacao/redacao-client"
import { redirect } from "next/navigation"
import Link from "next/link"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { getEssays } from "@/server/actions/essays"
import { Skeleton } from "@/components/ui/skeleton"

function RedacaoLoading() {
  return (
    <>
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Header with button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Essay cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

async function EssaysData({ userId }: { userId: string }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos
      },
    },
  })

  // Prefetch essays antes da hidratação
  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.essays.list(userId),
      queryFn: () => getEssays(userId),
    })
  } catch (error) {
    console.error("Error prefetching essays:", error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RedacaoClient userId={userId} />
    </HydrationBoundary>
  )
}

export default async function RedacaoPage() {
  // Get auth user
  const authUser = await getCurrentUser()

  if (!authUser) {
    redirect('/login?redirect=/redacao')
  }

  // Get user from database
  const userResult = await getUserProfile(authUser.id)

  if (!userResult.success || !userResult.data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Redação</h1>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Erro ao carregar dados do usuário</p>
        </div>
      </div>
    )
  }

  const user = userResult.data
  const isPaidUser = hasPaidPlan(user.plan)

  if (!isPaidUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="size-6 text-primary" />
            <h1 className="text-2xl font-bold">Redação</h1>
            <Badge variant="secondary" className="gap-1">
              <Lock className="size-3" />
              PRO
            </Badge>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8 text-center">
          <Lock className="mx-auto size-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            Recurso exclusivo do plano Rumo à Aprovação
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Faça upgrade para ter acesso à correção de redação por IA com feedback
            detalhado por competência e sugestões de melhoria.
          </p>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="grid gap-2 text-left">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="size-4 text-primary" />
                <span>Correção automática por IA</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="size-4 text-primary" />
                <span>Feedback por competência do ENEM</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="size-4 text-primary" />
                <span>Sugestões de melhoria personalizadas</span>
              </div>
            </div>

            <Button asChild size="lg" className="w-full">
              <Link href="/planos">
                <Sparkles className="mr-2 size-4" />
                Ver Planos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Redação</h1>
      </div>

      <p className="text-muted-foreground">
        Escreva e corrija suas redações com inteligência artificial seguindo os critérios do ENEM.
      </p>

      <Suspense fallback={<RedacaoLoading />}>
        <EssaysData userId={user.id} />
      </Suspense>
    </div>
  )
}
