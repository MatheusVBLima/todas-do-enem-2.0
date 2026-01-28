"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTotalAICosts, getCostsByUser } from "@/server/actions/admin"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Zap, MessageSquare, TrendingUp, RefreshCw } from "lucide-react"
import { UserCostsTable } from "./user-costs-table"
import { toast } from "sonner"

export function AdminStats() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: totalCosts, isLoading: loadingTotals, refetch: refetchTotals } = useQuery({
    queryKey: ["admin", "total-costs"],
    queryFn: async () => {
      const result = await getTotalAICosts()
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    staleTime: 0, // Always fetch fresh data for admin stats
    refetchOnWindowFocus: true,
  })

  const { data: userCosts, isLoading: loadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ["admin", "user-costs"],
    queryFn: async () => {
      const result = await getCostsByUser()
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    staleTime: 0, // Always fetch fresh data for admin stats
    refetchOnWindowFocus: true,
  })

  const handleRefresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    toast.dismiss("admin-refresh")

    try {
      await Promise.all([refetchTotals(), refetchUsers()])
      toast.success("Dados atualizados com sucesso", {
        id: "admin-refresh",
        description: "As estatisticas de IA foram atualizadas",
        duration: 3000,
      })
    } catch (error) {
      toast.error("Erro ao atualizar dados", {
        id: "admin-refresh",
        description: "Nao foi possivel atualizar as estatisticas. Tente novamente.",
        duration: 5000,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

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
      value: (totalCosts?.totalTokens || 0).toLocaleString("pt-BR"),
      description: "Tokens processados",
      icon: MessageSquare,
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Requisicoes",
      value: (totalCosts?.totalRequests || 0).toLocaleString("pt-BR"),
      description: "Total de chamadas",
      icon: TrendingUp,
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Taxa de Cache",
      value: `${totalCosts?.cacheHitRate.toFixed(1) || "0.0"}%`,
      description: `${totalCosts?.cacheHits || 0} hits`,
      icon: Zap,
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Estatisticas de IA</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

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
          <CardTitle>Gastos por Usuario</CardTitle>
          <CardDescription>
            Ranking de custos de IA por usuario (ordenado por gasto total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserCostsTable data={userCosts || []} isLoading={loadingUsers} />
        </CardContent>
      </Card>
    </div>
  )
}
