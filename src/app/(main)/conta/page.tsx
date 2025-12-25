import { User, Crown, Zap, CreditCard, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser, hasPaidPlan } from "@/lib/dev-user"
import { SUBSCRIPTION_PLANS } from "@/lib/constants"

export default function ContaPage() {
  const user = getCurrentUser()
  const isPaidUser = hasPaidPlan(user.plan)
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
              <CardDescription>Seus dados de cadastro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome completo</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
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
                <Button variant="outline" size="sm">
                  Ativar
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
                <Button variant="outline" size="sm">
                  Configurar
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

                <Button className="w-full" size="lg">
                  <Crown className="size-4" />
                  Fazer Upgrade Agora
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Cancele quando quiser. Sem compromisso.
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
                      Cartão terminado em 4242
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Atualizar
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Próxima cobrança</p>
                    <p className="text-sm text-muted-foreground">
                      R$25,00 em 01/02/2025
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
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
                  <Button variant="destructive" size="sm">
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
                  <p className="text-3xl font-bold">127</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Taxa de acerto</p>
                  <p className="text-3xl font-bold">68%</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Sequência atual</p>
                  <p className="text-3xl font-bold">7 dias</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 font-medium">Desempenho por área</h3>
                <div className="space-y-3">
                  {[
                    { area: "Matemática", acertos: 72, total: 100 },
                    { area: "Linguagens", acertos: 45, total: 60 },
                    { area: "Ciências Humanas", acertos: 38, total: 50 },
                    { area: "Ciências da Natureza", acertos: 28, total: 40 },
                  ].map((item) => (
                    <div key={item.area}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{item.area}</span>
                        <span className="text-muted-foreground">
                          {item.acertos}/{item.total} ({Math.round((item.acertos / item.total) * 100)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(item.acertos / item.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="rounded-lg border bg-muted/50 p-4 text-center">
                <BarChart3 className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="mb-1 font-medium">Gráficos detalhados em breve</p>
                <p className="text-sm text-muted-foreground">
                  Estamos trabalhando em visualizações ainda mais completas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
