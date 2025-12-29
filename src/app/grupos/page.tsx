import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getUserGroups } from "@/server/actions/groups"
import { getCurrentUser } from "@/lib/auth/server"
import { queryKeys } from "@/lib/query-keys"
import { GroupsClient } from "@/components/groups/groups-client"

export default async function GruposPage() {
  const authUser = await getCurrentUser()
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  })

  // Server-side prefetch de grupos do usuário
  if (authUser) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.groups.list(authUser.id),
      queryFn: () => getUserGroups(authUser.id),
    })
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GroupsClient />
    </HydrationBoundary>
  )
}
