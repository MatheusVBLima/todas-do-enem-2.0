import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getQuestion } from "@/server/actions/questions"
import { QuestionDetailClient } from "@/components/questions/question-detail-client"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { queryKeys } from "@/lib/query-keys"
import QuestionDetailLoading from "./loading"

interface QuestionPageProps {
  params: Promise<{
    id: string
  }>
}

async function QuestionData({ id }: { id: string }) {
  // Create QueryClient with staleTime: Infinity
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  })

  // Prefetch question (NON-BLOCKING - removed await)
  queryClient.prefetchQuery({
    queryKey: queryKeys.questions.detail(id),
    queryFn: () => getQuestion(id),
  })

  // Get current user plan
  const authUser = await getCurrentUser()
  let userPlan: string | null = null

  if (authUser) {
    const userResult = await getUserProfile(authUser.id)
    if (userResult.success && userResult.data) {
      userPlan = userResult.data.plan
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto max-w-4xl py-8">
        <QuestionDetailClient questionId={id} userPlan={userPlan} />
      </div>
    </HydrationBoundary>
  )
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<QuestionDetailLoading />}>
      <QuestionData id={id} />
    </Suspense>
  )
}
