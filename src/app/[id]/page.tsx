import { notFound } from "next/navigation"
import { getQuestion } from "@/server/actions/questions"
import { QuestionCard } from "@/components/questions/question-card"

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

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <QuestionCard question={question} />
    </div>
  )
}
