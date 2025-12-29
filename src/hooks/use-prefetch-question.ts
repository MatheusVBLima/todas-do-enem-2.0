import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { getQuestion } from "@/server/actions/questions"

export function usePrefetchQuestion() {
  const queryClient = useQueryClient()

  return useCallback((questionId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.questions.detail(questionId),
      queryFn: () => getQuestion(questionId),
    })
  }, [queryClient])
}
