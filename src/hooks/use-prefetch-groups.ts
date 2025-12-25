import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { getUserGroups } from "@/server/actions/groups"
import { DEV_USER } from "@/lib/dev-user"

export function usePrefetchGroups() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.groups.list(DEV_USER.id),
      queryFn: () => getUserGroups(DEV_USER.id),
    })
  }, [queryClient])
}
