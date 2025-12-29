import { notFound, redirect } from "next/navigation"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getEssay } from "@/server/actions/essays"
import { EssayCorrection } from "@/components/redacao/essay-correction"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { hasPaidPlan } from "@/lib/auth/permissions"
import { queryKeys } from "@/lib/query-keys"

interface EssayDetailPageProps {
  params: Promise<{
    id: string
  }>
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

  // Create QueryClient with staleTime: Infinity
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  })

  // Prefetch essay
  await queryClient.prefetchQuery({
    queryKey: queryKeys.essays.detail(id),
    queryFn: () => getEssay(id),
  })

  // Get essay from cache
  const result = queryClient.getQueryData(queryKeys.essays.detail(id)) as Awaited<ReturnType<typeof getEssay>> | undefined

  if (!result?.success || !result.data) {
    notFound()
  }

  const essay = result.data

  // Verify ownership
  if (essay.userId !== user.id) {
    notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EssayCorrection essay={essay} userId={user.id} />
    </HydrationBoundary>
  )
}
