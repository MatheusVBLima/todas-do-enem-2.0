import { notFound } from "next/navigation"
import { getQuestion } from "@/server/actions/questions"
import { QuestionCard } from "@/components/questions/question-card"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"

interface QuestionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { id } = await params
  const question = await getQuestion(id)

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
    <div className="container mx-auto max-w-4xl py-8">
      <QuestionCard question={question} userPlan={userPlan} />
    </div>
  )
}
