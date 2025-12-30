"use client"

import { useQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { QuestionCard } from "./question-card"
import { getQuestion } from "@/server/actions/questions"
import { queryKeys } from "@/lib/query-keys"

interface QuestionDetailClientProps {
  questionId: string
  userPlan: string | null
}

export function QuestionDetailClient({ questionId, userPlan }: QuestionDetailClientProps) {
  const { data: question, isPending } = useQuery({
    queryKey: queryKeys.questions.detail(questionId),
    queryFn: () => getQuestion(questionId),
    placeholderData: (previous) => previous,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  if (isPending && !question) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        <div className="h-5 w-72 bg-muted rounded animate-pulse" />
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded" />
            <div className="h-6 w-12 bg-muted rounded" />
          </div>
          <div className="h-20 w-full bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!question) {
    notFound()
  }

  return <QuestionCard question={question} userPlan={userPlan} />
}
