import { Suspense } from "react"
import { BookOpen } from "lucide-react"
import { QuestionFilters, QuestionList } from "@/components/questions"
import { QuestionListSkeleton } from "@/components/questions/question-list-skeleton"
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQuestions } from "@/server/actions/questions"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { queryKeys } from "@/lib/query-keys"

async function QuestionsData({ userId, userPlan }: { userId: string | null; userPlan: string | null }) {
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

  // Default filters for initial load
  const defaultFilters = {
    anos: [],
    areas: [],
    disciplinas: [],
    busca: "",
    pagina: 1,
  }

  // Prefetch questions on server so hydration already has data
  await queryClient.prefetchQuery({
    queryKey: queryKeys.questions.list(defaultFilters),
    queryFn: () => getQuestions(defaultFilters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuestionList userId={userId} userPlan={userPlan} />
    </HydrationBoundary>
  )
}

export default async function QuestoesPage() {
  // Paraleliza autenticação - não bloqueia renderização inicial
  const authUser = await getCurrentUser()

  // Se autenticado, busca perfil (não tem como paralelizar pois depende do authUser.id)
  const userPlan = authUser
    ? await getUserProfile(authUser.id).then(r => r.success ? r.data?.plan ?? null : null)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Questões do ENEM</h1>
      </div>

      <p className="text-muted-foreground">
        Navegue por todas as questões do ENEM desde 1998. Use os filtros para
        encontrar questões específicas.
      </p>

      <QuestionFilters />

      <Suspense fallback={<QuestionListSkeleton />}>
        <QuestionsData userId={authUser?.id || null} userPlan={userPlan} />
      </Suspense>
    </div>
  )
}
