import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, BookOpen } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/constants"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { hasPaidPlan } from "@/lib/auth/permissions"
import { Skeleton } from "@/components/ui/skeleton"

async function PlanBadge() {
  const authUser = await getCurrentUser()
  let isPaidUser = false

  if (authUser) {
    const userResult = await getUserProfile(authUser.id)
    if (userResult.success && userResult.data) {
      isPaidUser = hasPaidPlan(userResult.data.plan)
    }
  }

  if (!isPaidUser) return null

  return (
    <div className="flex justify-center">
      <Badge variant="default" className="px-4 py-2 text-sm">
        <Sparkles className="mr-2 size-4" />
        Você está no plano PRO
      </Badge>
    </div>
  )
}

async function PlanActions({ planType }: { planType: 'FREE' | 'PRO' }) {
  const authUser = await getCurrentUser()
  let isPaidUser = false

  if (authUser) {
    const userResult = await getUserProfile(authUser.id)
    if (userResult.success && userResult.data) {
      isPaidUser = hasPaidPlan(userResult.data.plan)
    }
  }

  if (planType === 'FREE') {
    return (
      <Button
        variant="outline"
        className="w-full"
        disabled={!isPaidUser}
      >
        {isPaidUser ? "Plano Atual" : "Plano Gratuito"}
      </Button>
    )
  }

  return isPaidUser ? (
    <Button className="w-full" disabled>
      <Check className="mr-2 size-4" />
      Plano Atual
    </Button>
  ) : (
    <Button className="w-full" disabled>
      <Sparkles className="mr-2 size-4" />
      Em breve - Integração com Polar
    </Button>
  )
}

export default function PlanosPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Escolha seu Plano</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Potencialize seus estudos para o ENEM com inteligência artificial
        </p>
      </div>

      {/* Current plan badge - Async */}
      <Suspense fallback={<div className="h-9" />}>
        <PlanBadge />
      </Suspense>

      {/* Plans comparison */}
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Free Plan */}
        <Card className="relative flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="size-6 text-muted-foreground" />
              <CardTitle className="text-2xl">Tentando a Sorte</CardTitle>
            </div>
            <CardDescription>
              Acesso básico às questões do ENEM
            </CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">Grátis</span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">O que está incluído:</h4>

              <div className="space-y-2">
                {SUBSCRIPTION_PLANS.TENTANDO_A_SORTE.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}

                <div className="flex items-start gap-2 opacity-50">
                  <Check className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm line-through">Explicação de questões por IA</span>
                </div>

                <div className="flex items-start gap-2 opacity-50">
                  <Check className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm line-through">Correção de redação por IA</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <PlanActions planType="FREE" />
            </Suspense>
          </CardFooter>
        </Card>

        {/* PRO Plan */}
        <Card className="relative flex flex-col border-primary shadow-lg">
          {/* Popular badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="px-4 py-1">
              <Sparkles className="mr-1 size-3" />
              Mais Popular
            </Badge>
          </div>

          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-6 text-primary" />
              <CardTitle className="text-2xl">Rumo à Aprovação</CardTitle>
            </div>
            <CardDescription>
              Acesso completo + inteligência artificial
            </CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">R$ 29,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">Tudo do plano gratuito, mais:</h4>

              <div className="space-y-2">
                {SUBSCRIPTION_PLANS.RUMO_A_APROVACAO.features.slice(1).map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}

                <div className="flex items-start gap-2">
                  <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm">Exportação PDF profissional</span>
                </div>

                <div className="flex items-start gap-2">
                  <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm">Suporte prioritário</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <PlanActions planType="PRO" />
            </Suspense>
          </CardFooter>
        </Card>
      </div>

      {/* FAQ or additional info */}
      <div className="mt-12 text-center space-y-4">
        <h2 className="text-2xl font-bold">Por que escolher o plano PRO?</h2>
        <div className="grid gap-6 md:grid-cols-3 text-left max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">IA de Última Geração</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Explicações detalhadas e correção de redação usando Google Gemini Flash,
                a mesma tecnologia dos melhores cursinhos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estudo Ilimitado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acesso completo a todas as questões do ENEM desde 1998,
                organize quantos grupos de estudo precisar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feedback Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Correção de redação com avaliação individual das 5 competências,
                igual ao ENEM oficial, com sugestões de melhoria.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
