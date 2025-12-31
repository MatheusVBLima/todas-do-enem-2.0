import { redirect, notFound } from "next/navigation"
import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getEssay } from "@/server/actions/essays"
import { EssayCorrectionClient } from "@/components/redacao/essay-correction-client"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { hasPaidPlan } from "@/lib/auth/permissions"
import { queryKeys } from "@/lib/query-keys"
import { EssaySkeleton } from "@/components/redacao/essay-skeleton"
import type { Metadata } from "next"

interface EssayDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const result = await getEssay(id)

  if (!result.success || !result.data) {
    return {
      title: "Redação não encontrada | Todas do ENEM",
      description: "Esta redação não está disponível.",
    }
  }

  const essay = result.data
  const statusText = essay.status === "SUBMITTED" ? "Em correção" :
                     essay.status === "CORRECTED" ? "Corrigida" : "Rascunho"
  const essayTitle = essay.title || essay.theme || "Redação"

  return {
    title: `${essayTitle} - ${statusText} | Redação | Todas do ENEM`,
    description: `Redação sobre "${essayTitle}" - Status: ${statusText}`,
  }
}

async function EssayData({ id, userId, userPlan }: { id: string; userId: string; userPlan: string }) {
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

  // Prefetch essay before hydration
  await queryClient.prefetchQuery({
    queryKey: queryKeys.essays.detail(id),
    queryFn: async () => {
      const result = await getEssay(id)

      if (!result.success || !result.data) {
        throw new Error(result.error || "Essay not found")
      }

      return result.data
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EssayCorrectionClient essayId={id} userId={userId} userPlan={userPlan} />
    </HydrationBoundary>
  )
}

export default async function EssayDetailPage({ params }: EssayDetailPageProps) {
  const { id } = await params

  // Get auth user
  const authUser = await getCurrentUser()

  if (!authUser) {
    redirect('/login?redirect=/redacao/' + id)
  }

  // Get user from database
  const userResult = await getUserProfile(authUser.id)

  if (!userResult.success || !userResult.data) {
    notFound()
  }

  const user = userResult.data
  const isPaidUser = hasPaidPlan(user.plan)

  if (!isPaidUser) {
    redirect("/redacao")
  }

  return (
    <Suspense fallback={<EssaySkeleton />}>
      <EssayData id={id} userId={user.id} userPlan={user.plan} />
    </Suspense>
  )
}
