import { Suspense } from "react"
import { BookOpen } from "lucide-react"
import { QuestionFilters, QuestionList } from "@/components/questions"
import { QuestionListSkeleton } from "@/components/questions/question-list-skeleton"
import { getQuestions } from "@/server/actions/questions"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import type { PaginatedResponse, QuestionWithExam, QuestionFilters as QFilters } from "@/types"

// Default filters for initial load
const defaultFilters: QFilters = {
  anos: [],
  areas: [],
  disciplinas: [],
  busca: "",
  pagina: 1,
}

async function QuestionsData({
  userId,
  userPlan,
  questionsPromise,
}: {
  userId: string | null
  userPlan: string | null
  questionsPromise: Promise<PaginatedResponse<QuestionWithExam>>
}) {
  // Await the promise that was started in parallel with auth
  const initialData = await questionsPromise

  return (
    <QuestionList
      userId={userId}
      userPlan={userPlan}
      initialData={initialData}
      initialFilters={defaultFilters}
    />
  )
}

export default async function QuestoesPage() {
  // Start questions fetch immediately - doesn't depend on auth (parallel)
  const questionsPromise = getQuestions(defaultFilters)

  // Auth flow runs in parallel with questions fetch
  const authUser = await getCurrentUser()

  // Se autenticado, busca perfil (depende do authUser.id)
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
        <QuestionsData
          userId={authUser?.id || null}
          userPlan={userPlan}
          questionsPromise={questionsPromise}
        />
      </Suspense>
    </div>
  )
}
