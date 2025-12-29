import { notFound } from "next/navigation"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getQuestion } from "@/server/actions/questions"
import { QuestionCard } from "@/components/questions/question-card"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { queryKeys } from "@/lib/query-keys"
import type { QuestionWithExam } from "@/types"

interface QuestionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { id } = await params

  // Create QueryClient with staleTime: Infinity
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  })

  // Prefetch question
  await queryClient.prefetchQuery({
    queryKey: queryKeys.questions.detail(id),
    queryFn: () => getQuestion(id),
  })

  // Get question from cache
  const question = queryClient.getQueryData(queryKeys.questions.detail(id)) as QuestionWithExam | undefined

  if (!question) {
    notFound()
  }

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
        <QuestionCard question={question} userPlan={userPlan} />
      </div>
    </HydrationBoundary>
  )
}
