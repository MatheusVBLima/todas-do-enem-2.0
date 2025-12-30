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
import RedacaoLoading from "./loading"

async function EssaysData({ userId }: { userId: string }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  })

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
    <Suspense fallback={<RedacaoLoading />}>
      <EssaysData userId={user.id} />
    </Suspense>
  )
}
