import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getUserGroups } from "@/server/actions/groups"
import { DEV_USER } from "@/lib/dev-user"
import { queryKeys } from "@/lib/query-keys"
import { GroupsClient } from "@/components/groups/groups-client"

export default async function GruposPage() {
  const queryClient = new QueryClient()

  // Server-side prefetch de grupos do usuário
  await queryClient.prefetchQuery({
    queryKey: queryKeys.groups.list(DEV_USER.id),
    queryFn: () => getUserGroups(DEV_USER.id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GroupsClient />
    </HydrationBoundary>
  )
}
