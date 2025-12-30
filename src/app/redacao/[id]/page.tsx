import { redirect, notFound } from "next/navigation"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getEssay } from "@/server/actions/essays"
import { EssayCorrectionClient } from "@/components/redacao/essay-correction-client"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { hasPaidPlan } from "@/lib/auth/permissions"
import { queryKeys } from "@/lib/query-keys"
import EssayDetailLoading from "./loading"
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

async function EssayData({ id, userId }: { id: string; userId: string }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })

  // Prefetch essay before hydration
  await queryClient.prefetchQuery({
    queryKey: queryKeys.essays.detail(id),
    queryFn: () => getEssay(id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EssayCorrectionClient essayId={id} userId={userId} />
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
    <EssayData id={id} userId={user.id} />
  )
}
