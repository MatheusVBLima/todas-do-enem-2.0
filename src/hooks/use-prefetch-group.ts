import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { getGroup } from "@/server/actions/groups"

export function usePrefetchGroup() {
  const queryClient = useQueryClient()

  return useCallback((groupId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.groups.detail(groupId),
      queryFn: async () => {
        const result = await getGroup(groupId)
        return result.success ? result.data : null
      },
    })
  }, [queryClient])
}
