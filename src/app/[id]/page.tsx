import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getQuestion } from "@/server/actions/questions"
import { QuestionDetailClient } from "@/components/questions/question-detail-client"
import { QuestionSkeleton } from "@/components/questions/question-skeleton"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { queryKeys } from "@/lib/query-keys"
import type { Metadata } from "next"
import { capitalizeSentences } from "@/lib/text-utils"

interface QuestionPageProps {
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
  const result = await getQuestion(id)

  if (!result) {
    return {
      title: "Questão não encontrada | Todas do ENEM",
      description: "Esta questão não está disponível.",
    }
  }

  const question = result

  // Capitalizar e truncar para SEO
  const statement = capitalizeSentences(question.statement)
  const truncatedStatement = statement.length > 157
    ? statement.substring(0, 157) + "..."
    : statement

  return {
    title: `Q${question.questionNumber} - ${question.exam.year} | Todas do ENEM`,
    description: truncatedStatement,
  }
}

async function QuestionData({ id }: { id: string }) {
  // Create QueryClient with extended cache
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

  // Prefetch question before hydration
  await queryClient.prefetchQuery({
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
      <QuestionDetailClient questionId={id} userPlan={userPlan} />
    </HydrationBoundary>
  )
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { id } = await params

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Suspense fallback={<QuestionSkeleton />}>
        <QuestionData id={id} />
      </Suspense>
    </div>
  )
}
