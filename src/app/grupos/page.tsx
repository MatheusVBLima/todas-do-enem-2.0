import { Suspense } from "react"
import { FolderOpen } from "lucide-react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getUserGroups } from "@/server/actions/groups"
import { getCurrentUser } from "@/lib/auth/server"
import { queryKeys } from "@/lib/query-keys"
import { GroupsClient } from "@/components/groups/groups-client"
import { GroupSkeleton } from "@/components/groups/group-skeleton"

async function GroupsData({ userId }: { userId: string | null }) {
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

  // Server-side prefetch de grupos do usuário (aguardado)
  if (userId) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.groups.list(userId),
      queryFn: () => getUserGroups(userId),
    })
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GroupsClient userId={userId} />
    </HydrationBoundary>
  )
}

export default async function GruposPage() {
  const authUser = await getCurrentUser()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Grupos de Questões</h1>
      </div>

      <p className="text-muted-foreground">
        Organize suas questões em grupos para estudar de forma mais eficiente.
      </p>

      <Suspense fallback={<GroupSkeleton />}>
        <GroupsData userId={authUser?.id || null} />
      </Suspense>
    </div>
  )
}
