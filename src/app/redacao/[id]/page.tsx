import { Suspense } from "react"
import { redirect, notFound } from "next/navigation"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getEssay } from "@/server/actions/essays"
import { EssayCorrectionClient } from "@/components/redacao/essay-correction-client"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { hasPaidPlan } from "@/lib/auth/permissions"
import { queryKeys } from "@/lib/query-keys"
import EssayDetailLoading from "./loading"

interface EssayDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function EssayData({ id, userId }: { id: string; userId: string }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  })

  // Prefetch essay (NON-BLOCKING - removed await)
  queryClient.prefetchQuery({
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
    <Suspense fallback={<EssayDetailLoading />}>
      <EssayData id={id} userId={user.id} />
    </Suspense>
  )
}
