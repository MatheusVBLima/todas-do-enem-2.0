import { FileText, Lock, Sparkles, Clock } from "lucide-react"
import { Suspense } from "react"
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
import { RedacaoSkeleton } from "@/components/redacao/redacao-skeleton"

async function EssaysData({ userId, userPlan }: { userId: string; userPlan: string }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 30, // 30 minutos
        gcTime: 1000 * 60 * 60 * 24, // 24 horas
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
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
      <RedacaoClient userId={userId} userPlan={userPlan} />
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
        <div className="flex items-center gap-3">
          <FileText className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Redação</h1>
          <Badge variant="secondary" className="gap-1">
            <Clock className="size-3" />
            Em breve
          </Badge>
        </div>

        <div className="rounded-lg border bg-card p-8 text-center">
          <Clock className="mx-auto size-12 text-primary mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            Correção de Redação Em Breve
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Estamos preparando uma experiência incrível de correção de redação
            por inteligência artificial. Continue estudando as questões!
          </p>

          <div className="space-y-4 max-w-md mx-auto">
            <div className="grid gap-2 text-left">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>Correção automática por IA</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>Feedback por competência do ENEM</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>Sugestões de melhoria personalizadas</span>
              </div>
            </div>
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

      <Suspense fallback={<RedacaoSkeleton />}>
        <EssaysData userId={user.id} userPlan={user.plan} />
      </Suspense>
    </div>
  )
}
