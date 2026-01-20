"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTotalAICosts, getCostsByUser } from "@/server/actions/admin"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Zap, MessageSquare, TrendingUp } from "lucide-react"
import { UserCostsTable } from "./user-costs-table"

export function AdminStats() {
  const { data: totalCosts, isLoading: loadingTotals } = useQuery({
    queryKey: ["admin", "total-costs"],
    queryFn: async () => {
      const result = await getTotalAICosts()
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - admin data doesn't need constant refreshing
    refetchOnWindowFocus: false,
  })

  const { data: userCosts, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin", "user-costs"],
    queryFn: async () => {
      const result = await getCostsByUser()
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - admin data doesn't need constant refreshing
    refetchOnWindowFocus: false,
  })

  if (loadingTotals) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Custo Total",
      value: `R$ ${totalCosts?.totalCostBRL.toFixed(2) || '0.00'}`,
      description: "Gasto total com IA",
      icon: DollarSign,
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Total de Tokens",
      value: (totalCosts?.totalTokens || 0).toLocaleString('pt-BR'),
      description: "Tokens processados",
      icon: MessageSquare,
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Requisições",
      value: (totalCosts?.totalRequests || 0).toLocaleString('pt-BR'),
      description: "Total de chamadas",
      icon: TrendingUp,
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Taxa de Cache",
      value: `${totalCosts?.cacheHitRate.toFixed(1) || '0.0'}%`,
      description: `${totalCosts?.cacheHits || 0} hits`,
      icon: Zap,
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`size-4 ${stat.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* User Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Usuário</CardTitle>
          <CardDescription>
            Ranking de custos de IA por usuário (ordenado por gasto total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserCostsTable data={userCosts || []} isLoading={loadingUsers} />
        </CardContent>
      </Card>
    </div>
  )
}
