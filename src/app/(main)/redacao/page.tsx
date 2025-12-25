import { FileText, Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, hasPaidPlan } from "@/lib/dev-user"

export default function RedacaoPage() {
  const user = getCurrentUser()
  const isPaidUser = hasPaidPlan(user.plan)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Redação</h1>
          {!isPaidUser && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="size-3" />
              PRO
            </Badge>
          )}
        </div>

        <Button disabled={!isPaidUser}>
          <Plus className="size-4" />
          Nova Redação
        </Button>
      </div>

      {isPaidUser ? (
        <>
          <p className="text-muted-foreground">
            Escreva suas redações e receba correção automática por IA seguindo as competências do ENEM.
          </p>

          <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
            Em breve: Editor de redação com correção por IA
          </div>
        </>
      ) : (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Lock className="mx-auto size-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Recurso exclusivo do plano Rumo à Aprovação</h2>
          <p className="text-muted-foreground mb-4">
            Faça upgrade para ter acesso à correção de redação por IA com feedback detalhado por competência.
          </p>
          <Button>Fazer Upgrade</Button>
        </div>
      )}
    </div>
  )
}
