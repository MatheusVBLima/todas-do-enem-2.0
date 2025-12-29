import { User, Crown, Zap, CreditCard, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SUBSCRIPTION_PLANS } from "@/lib/constants"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { redirect } from "next/navigation"
import { EditProfileForm } from "@/components/conta/edit-profile-form"

export default async function ContaPage() {
  // Get auth user
  const authUser = await getCurrentUser()

  if (!authUser) {
    redirect('/login')
  }

  // Get user from database
  const userResult = await getUserProfile(authUser.id)

  if (!userResult.success || !userResult.data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Minha Conta</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Erro ao carregar perfil do usuário</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = userResult.data
  const isPaidUser = user.plan === 'RUMO_A_APROVACAO'
  const currentPlan = isPaidUser
    ? SUBSCRIPTION_PLANS.RUMO_A_APROVACAO
    : SUBSCRIPTION_PLANS.TENTANDO_A_SORTE

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Minha Conta</h1>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="perfil">
            <User className="mr-2 size-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="assinatura">
            <CreditCard className="mr-2 size-4" />
            Assinatura
          </TabsTrigger>
          <TabsTrigger value="estatisticas">
            <BarChart3 className="mr-2 size-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Perfil */}
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados de cadastro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditProfileForm
                authUserId={authUser.id}
                currentName={user.name}
              />

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Plano atual</p>
                <Badge variant={isPaidUser ? "default" : "secondary"}>
                  {currentPlan.name}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>Configurações de estudo e notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações por email</p>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações sobre seu progresso
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Em breve
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Meta diária de questões</p>
                  <p className="text-sm text-muted-foreground">
                    Defina quantas questões quer resolver por dia
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Em breve
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Assinatura */}
        <TabsContent value="assinatura" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Plano Atual
                <Badge variant={isPaidUser ? "default" : "secondary"}>
                  {currentPlan.name}
                </Badge>
              </CardTitle>
              <CardDescription>
                {isPaidUser
                  ? "Você tem acesso a todos os recursos premium"
                  : "Faça upgrade para desbloquear recursos exclusivos"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {currentPlan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Zap className="size-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {!isPaidUser && (
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="size-5 text-primary" />
                  Rumo à Aprovação
                </CardTitle>
                <CardDescription>
                  Desbloqueie o poder da IA para seus estudos e alcance a aprovação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">R$25</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>

                <Separator />

                <div>
                  <p className="mb-3 font-medium">Recursos incluídos:</p>
                  <ul className="space-y-2">
                    {SUBSCRIPTION_PLANS.RUMO_A_APROVACAO.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Zap className="size-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full" size="lg" disabled>
                  <Crown className="size-4" />
                  Em breve - Pagamentos
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Sistema de pagamentos será implementado em breve
                </p>
              </CardContent>
            </Card>
          )}

          {isPaidUser && (
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Assinatura</CardTitle>
                <CardDescription>
                  Administre sua assinatura e formas de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Forma de pagamento</p>
                    <p className="text-sm text-muted-foreground">
                      Configuração em breve
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Atualizar
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Próxima cobrança</p>
                    <p className="text-sm text-muted-foreground">
                      Sistema de cobrança em desenvolvimento
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Ver faturas
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">Cancelar assinatura</p>
                    <p className="text-sm text-muted-foreground">
                      Você perderá acesso aos recursos premium
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Estatísticas */}
        <TabsContent value="estatisticas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seu Progresso</CardTitle>
              <CardDescription>
                Acompanhe sua evolução nos estudos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Questões resolvidas</p>
                  <p className="text-3xl font-bold">-</p>
                  <p className="text-xs text-muted-foreground mt-1">Em breve</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Taxa de acerto</p>
                  <p className="text-3xl font-bold">-</p>
                  <p className="text-xs text-muted-foreground mt-1">Em breve</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Sequência atual</p>
                  <p className="text-3xl font-bold">-</p>
                  <p className="text-xs text-muted-foreground mt-1">Em breve</p>
                </div>
              </div>

              <Separator />

              <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <BarChart3 className="mx-auto mb-3 size-12 text-muted-foreground" />
                <p className="mb-2 font-medium text-lg">Estatísticas detalhadas em breve</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Estamos trabalhando em um sistema completo de acompanhamento de progresso
                  com gráficos, desempenho por área de conhecimento e muito mais
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
