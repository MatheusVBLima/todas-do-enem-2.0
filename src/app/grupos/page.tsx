import { Suspense } from "react"
import { FolderOpen } from "lucide-react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getUserGroups } from "@/server/actions/groups"
import { getCurrentUser } from "@/lib/auth/server"
import { queryKeys } from "@/lib/query-keys"
import { GroupsClient } from "@/components/groups/groups-client"
import { Skeleton } from "@/components/ui/skeleton"

function GruposLoading() {
  return (
    <>
      <div className="flex items-center justify-end">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

async function GroupsData({ userId }: { userId: string | null }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos
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

      <Suspense fallback={<GruposLoading />}>
        <GroupsData userId={authUser?.id || null} />
      </Suspense>
    </div>
  )
}
