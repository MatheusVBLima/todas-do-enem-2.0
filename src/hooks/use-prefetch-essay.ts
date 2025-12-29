import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { getEssay } from "@/server/actions/essays"

export function usePrefetchEssay() {
  const queryClient = useQueryClient()

  return useCallback((essayId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.essays.detail(essayId),
      queryFn: async () => {
        const result = await getEssay(essayId)
        return result.success ? result.data : null
      },
    })
  }, [queryClient])
}
