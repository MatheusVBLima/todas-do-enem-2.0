import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getGroup } from "@/server/actions/groups"
import { queryKeys } from "@/lib/query-keys"
import { GroupDetailClient } from "@/components/groups/group-detail-client"

interface GroupDetailPageProps {
  params: Promise<{ id: string }>
}

async function GroupData({ id }: { id: string }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })

  // Server-side prefetch do grupo específico (aguardado)
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

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = await params

  return (
    <GroupData id={id} />
  )
}
