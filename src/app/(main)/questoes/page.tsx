import { Suspense } from "react"
import { BookOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { QuestionFilters, QuestionList } from "@/components/questions"
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQuestions } from "@/server/actions/questions"
import { queryKeys } from "@/lib/query-keys"

export default async function QuestoesPage() {
  const queryClient = new QueryClient()

  // Default filters for initial load
  const defaultFilters = {
    anos: [],
    areas: [],
    disciplinas: [],
    busca: "",
    pagina: 1,
  }

  // Prefetch questions on server
  await queryClient.prefetchQuery({
    queryKey: queryKeys.questions.list(defaultFilters),
    queryFn: () => getQuestions(defaultFilters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Questões do ENEM</h1>
        </div>

        <p className="text-muted-foreground">
          Navegue por todas as questões do ENEM desde 1998. Use os filtros para
          encontrar questões específicas.
        </p>

        <Suspense fallback={<QuestoesLoading />}>
          <QuestionFilters />
          <QuestionList />
        </Suspense>
      </div>
    </HydrationBoundary>
  )
}

function QuestoesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-12 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
