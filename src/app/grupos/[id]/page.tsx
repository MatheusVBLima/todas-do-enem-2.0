import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getGroup } from "@/server/actions/groups"
import { queryKeys } from "@/lib/query-keys"
import { GroupDetailClient } from "@/components/groups/group-detail-client"
import GroupDetailLoading from "./loading"

interface GroupDetailPageProps {
  params: Promise<{ id: string }>
}

async function GroupData({ id }: { id: string }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  })

  // Server-side prefetch do grupo específico (NON-BLOCKING - removed await)
  queryClient.prefetchQuery({
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
    <Suspense fallback={<GroupDetailLoading />}>
      <GroupData id={id} />
    </Suspense>
  )
}
