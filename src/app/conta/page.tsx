import { Suspense } from "react"
import { User, Crown, Zap, CreditCard, BarChart3, Calendar, AlertCircle, Shield } from "lucide-react"

// Disable cache for this page - always fetch fresh data
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SUBSCRIPTION_PLANS } from "@/lib/constants"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { getSubscriptionDetails } from "@/server/actions/stripe"
import { redirect } from "next/navigation"
import { EditProfileForm } from "@/components/conta/edit-profile-form"
import { Skeleton } from "@/components/ui/skeleton"
import { CancelSubscriptionButton } from "@/components/conta/cancel-subscription-button"
import { ReactivateSubscriptionButton } from "@/components/conta/reactivate-subscription-button"
import { SubscribeButton } from "@/components/stripe/subscribe-button"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QuotaDisplay } from "@/components/ai/quota-display"
import { AdminStats } from "@/components/admin/admin-stats"
import { UserStatistics } from "@/components/conta/user-statistics"
import { DailyGoalCard } from "@/components/conta/daily-goal-card"

async function AccountData({ userId }: { userId: string }) {
  const userResult = await getUserProfile(userId)

  if (!userResult.success || !userResult.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Erro ao carregar perfil do usuário</p>
        </CardContent>
      </Card>
    )
  }

  const user = userResult.data
  const isPaidUser = user.plan === 'RUMO_A_APROVACAO'
  const isAdmin = user.role === 'ADMIN'
  const currentPlan = isPaidUser
    ? SUBSCRIPTION_PLANS.RUMO_A_APROVACAO
    : SUBSCRIPTION_PLANS.TENTANDO_A_SORTE

  // Fetch subscription details if user has Stripe subscription
  const subscriptionDetails = user.stripeSubscriptionId
    ? await getSubscriptionDetails()
    : null

  const hasActiveSubscription = user.stripeSubscriptionId && user.stripeSubscriptionStatus === 'active'

  return (
    <Tabs defaultValue="perfil" className="space-y-6">
      <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4 lg:w-[500px]' : 'grid-cols-3 lg:w-[400px]'}`}>
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
        {isAdmin && (
          <TabsTrigger value="admin">
            <Shield className="mr-2 size-4" />
            Admin
          </TabsTrigger>
        )}
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
              authUserId={userId}
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
                <span className="text-4xl font-bold">R$ 29,90</span>
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

              <SubscribeButton userId={userId} />

              <p className="text-center text-xs text-muted-foreground">
                Pagamento seguro processado pelo Stripe
              </p>
            </CardContent>
          </Card>
        )}

        {isPaidUser && !hasActiveSubscription && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              Seu plano foi configurado manualmente. Para gerenciar sua assinatura via Stripe,
              faça o downgrade para o plano Tentando a Sorte e assine novamente através da página de planos.
            </AlertDescription>
          </Alert>
        )}

        {isPaidUser && hasActiveSubscription && (
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Assinatura</CardTitle>
              <CardDescription>
                Administre sua assinatura e formas de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subscription Status Alert if Cancellation Scheduled */}
              {subscriptionDetails?.success && subscriptionDetails.data?.cancelAtPeriodEnd && (
                <Alert>
                  <Calendar className="size-4" />
                  <AlertDescription className="flex items-start justify-between gap-4">
                    <div>
                      <strong>Assinatura cancelada.</strong> Você manterá acesso aos recursos PRO até{' '}
                      {subscriptionDetails.data.cancelAt &&
                        new Date(subscriptionDetails.data.cancelAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                    </div>
                    <ReactivateSubscriptionButton />
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Forma de pagamento</p>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionDetails?.success && subscriptionDetails.data?.cardLast4
                      ? `${subscriptionDetails.data.cardBrand?.toUpperCase() || 'Cartão'} •••• ${subscriptionDetails.data.cardLast4}`
                      : 'Cartão de crédito'}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/planos">
                    Atualizar
                  </Link>
                </Button>
              </div>
              <Separator />

              {subscriptionDetails?.success && subscriptionDetails.data?.createdAt && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Assinatura desde</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(subscriptionDetails.data.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Próxima cobrança</p>
                  <p className="text-sm text-muted-foreground">
                    {user.stripeCurrentPeriodEnd
                      ? new Date(user.stripeCurrentPeriodEnd).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Data não disponível'}
                  </p>
                </div>
                <p className="text-sm font-medium">R$ 29,90</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-destructive">Cancelar assinatura</p>
                  <p className="text-sm text-muted-foreground">
                    Você manterá acesso até o fim do período de cobrança
                  </p>
                </div>
                {subscriptionDetails?.success && subscriptionDetails.data?.cancelAtPeriodEnd ? (
                  <Button variant="outline" size="sm" disabled>
                    Cancelada
                  </Button>
                ) : (
                  <CancelSubscriptionButton periodEnd={user.stripeCurrentPeriodEnd} />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Tab: Estatísticas */}
      <TabsContent value="estatisticas" className="space-y-4">
        {/* AI Quota Display for paid users */}
        {isPaidUser && (
          <QuotaDisplay userId={userId} userPlan={user.plan} variant="full" />
        )}

        {/* Daily Goal */}
        <DailyGoalCard userId={userId} />

        {/* User Statistics with charts */}
        <UserStatistics userId={userId} />
      </TabsContent>

      {/* Tab: Admin */}
      {isAdmin && (
        <TabsContent value="admin" className="space-y-4">
          <AdminStats />
        </TabsContent>
      )}
    </Tabs>
  )
}

export default async function ContaPage() {
  const authUser = await getCurrentUser()

  if (!authUser) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Minha Conta</h1>
      </div>

      <Suspense fallback={<div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>}>
        <AccountData userId={authUser.id} />
      </Suspense>
    </div>
  )
}
