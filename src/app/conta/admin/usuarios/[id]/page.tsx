import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Mail, Crown, Calendar, DollarSign, MessageSquare, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserDetails } from "@/server/actions/admin"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PageProps {
  params: Promise<{ id: string }>
}

async function UserDetailsContent({ userId }: { userId: string }) {
  const result = await getUserDetails(userId)

  if (!result.success || !result.data) {
    notFound()
  }

  const user = result.data
  const cacheHitRate = user.totalRequests > 0
    ? ((user.cacheHits / user.totalRequests) * 100).toFixed(1)
    : '0.0'

  const getPlanBadge = (plan: string) => {
    if (plan === 'RUMO_A_APROVACAO') {
      return <Badge>Rumo à Aprovação</Badge>
    }
    return <Badge>Tentando a Sorte</Badge>
  }

  const getSubscriptionBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Sem assinatura</Badge>
    switch (status) {
      case 'active':
        return <Badge>Ativa</Badge>
      case 'canceled':
        return <Badge variant="outline">Cancelada</Badge>
      case 'past_due':
        return <Badge variant="outline">Pagamento pendente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/conta?tab=admin">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.userName}</h1>
          <p className="text-muted-foreground">{user.userEmail}</p>
        </div>
        {getPlanBadge(user.plan)}
      </div>

      {/* User Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-primary" />
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="font-medium">{user.userEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plano</span>
              {getPlanBadge(user.plan)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status Stripe</span>
              {getSubscriptionBadge(user.stripeSubscriptionStatus)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cadastrado em</span>
              <span className="text-sm">
                {format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4 text-primary" />
              Atividade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Último uso de IA</span>
              <span className="text-sm">
                {formatDistanceToNow(new Date(user.lastUsed), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de requisições</span>
              <span className="font-mono font-medium">{user.totalRequests.toLocaleString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Uso de IA</CardTitle>
          <CardDescription>Estatísticas de consumo de tokens e custos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="size-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Custo Total</span>
              </div>
              <p className="text-2xl font-bold">R$ {user.totalCostBRL.toFixed(2)}</p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="size-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Tokens</span>
              </div>
              <p className="text-2xl font-bold">{user.totalTokens.toLocaleString('pt-BR')}</p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Requisições</span>
              </div>
              <p className="text-2xl font-bold">{user.totalRequests.toLocaleString('pt-BR')}</p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="size-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Cache Hits</span>
              </div>
              <p className="text-2xl font-bold">{user.cacheHits}</p>
              <p className="text-xs text-muted-foreground">{cacheHitRate}% taxa de cache</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params
  const authUser = await getCurrentUser()

  if (!authUser) {
    redirect('/login')
  }

  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    }>
      <UserDetailsContent userId={id} />
    </Suspense>
  )
}
