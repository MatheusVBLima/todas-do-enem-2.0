import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { getEssays } from "@/server/actions/essays"

export function usePrefetchEssays(userId: string | null) {
  const queryClient = useQueryClient()

  return useCallback(() => {
    if (!userId) return // Guard para usuário não logado

    queryClient.prefetchQuery({
      queryKey: queryKeys.essays.list(userId),
      queryFn: () => getEssays(userId),
    })
  }, [queryClient, userId])
}
