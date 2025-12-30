import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getGroup } from "@/server/actions/groups"
import { queryKeys } from "@/lib/query-keys"
import { GroupDetailClient } from "@/components/groups/group-detail-client"
import { GroupSkeleton } from "@/components/groups/group-skeleton"
import type { Metadata } from "next"

interface GroupDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const result = await getGroup(id)

  if (!result.success || !result.data) {
    return {
      title: "Grupo não encontrado | Todas do ENEM",
      description: "Este grupo não está disponível.",
    }
  }

  const group = result.data
  const questionCount = group.questions?.length || 0

  return {
    title: `${group.name} | Grupos | Todas do ENEM`,
    description: group.description || `Grupo de estudos com ${questionCount} questões`,
  }
}

async function GroupData({ id }: { id: string }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 30, // 30 minutos
        gcTime: 1000 * 60 * 60 * 24, // 24 horas
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
    <Suspense fallback={<GroupSkeleton />}>
      <GroupData id={id} />
    </Suspense>
  )
}
