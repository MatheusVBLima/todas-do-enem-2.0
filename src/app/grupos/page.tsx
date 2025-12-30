import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getUserGroups } from "@/server/actions/groups"
import { getCurrentUser } from "@/lib/auth/server"
import { queryKeys } from "@/lib/query-keys"
import { GroupsClient } from "@/components/groups/groups-client"
import GruposLoading from "./loading"

async function GroupsData({ userId }: { userId: string | null }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  })

  // Server-side prefetch de grupos do usuário
  if (userId) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.groups.list(userId),
      queryFn: () => getUserGroups(userId),
    })
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GroupsClient />
    </HydrationBoundary>
  )
}

export default async function GruposPage() {
  const authUser = await getCurrentUser()

  return (
    <Suspense fallback={<GruposLoading />}>
      <GroupsData userId={authUser?.id || null} />
    </Suspense>
  )
}
