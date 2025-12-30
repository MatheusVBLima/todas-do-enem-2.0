"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { QuestionCard } from "./question-card"
import { getQuestion } from "@/server/actions/questions"
import { queryKeys } from "@/lib/query-keys"

interface QuestionDetailClientProps {
  questionId: string
  userPlan: string | null
}

export function QuestionDetailClient({ questionId, userPlan }: QuestionDetailClientProps) {
  const { data: question } = useSuspenseQuery({
    queryKey: queryKeys.questions.detail(questionId),
    queryFn: () => getQuestion(questionId),
  })

  if (!question) {
    notFound()
  }

  return <QuestionCard question={question} userPlan={userPlan} />
}
