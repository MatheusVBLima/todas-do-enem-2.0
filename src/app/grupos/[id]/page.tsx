import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getGroup } from "@/server/actions/groups"
import { queryKeys } from "@/lib/query-keys"
import { GroupDetailClient } from "@/components/groups/group-detail-client"

interface GroupDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = await params
  const queryClient = new QueryClient()

  // Server-side prefetch do grupo específico
  await queryClient.prefetchQuery({
    queryKey: queryKeys.groups.detail(id),
    queryFn: async () => {
      const result = await getGroup(id)
      return result.success ? result.data : null
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GroupDetailClient />
    </HydrationBoundary>
  )
}
