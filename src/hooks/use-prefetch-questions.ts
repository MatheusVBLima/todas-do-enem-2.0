"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { queryKeys } from "@/lib/query-keys"
import { getQuestions } from "@/server/actions/questions"
import type { QuestionFilters } from "@/types"

/**
 * Custom hook for prefetching questions
 * Usage: const prefetchQuestions = usePrefetchQuestions()
 *        prefetchQuestions(filters)
 */
export function usePrefetchQuestions() {
  const queryClient = useQueryClient()

  return useCallback(
    (filters: QuestionFilters) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.questions.list(filters),
        queryFn: () => getQuestions(filters),
      })
    },
    [queryClient]
  )
}
