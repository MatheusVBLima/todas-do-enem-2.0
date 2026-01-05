"use client"

import { useQuery } from "@tanstack/react-query"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Target, Flame, TrendingUp, BarChart3 } from "lucide-react"
import { getUserStatistics } from "@/server/actions/statistics"
import { KNOWLEDGE_AREAS } from "@/lib/constants"

interface UserStatisticsProps {
  userId: string
}

const chartConfig = {
  accuracyRate: {
    label: "Taxa de Acerto",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

// Map area IDs to display names and colors
const areaConfig: Record<string, { label: string; color: string }> = {
  LINGUAGENS: { label: "Linguagens", color: KNOWLEDGE_AREAS.LINGUAGENS.color },
  CIENCIAS_HUMANAS: { label: "Humanas", color: KNOWLEDGE_AREAS.CIENCIAS_HUMANAS.color },
  CIENCIAS_NATUREZA: { label: "Natureza", color: KNOWLEDGE_AREAS.CIENCIAS_NATUREZA.color },
  MATEMATICA: { label: "Matemática", color: KNOWLEDGE_AREAS.MATEMATICA.color },
}

export function UserStatistics({ userId }: UserStatisticsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-statistics", userId],
    queryFn: async () => {
      const result = await getUserStatistics(userId)
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always', // Always refetch when component mounts
  })

  if (isLoading) {
    return <UserStatisticsSkeleton />
  }

  if (!stats) {
    return null
  }

  // Prepare chart data
  const chartData = stats.performanceByArea.map((area) => ({
    area: areaConfig[area.area]?.label || area.area,
    accuracyRate: area.accuracyRate,
    total: area.total,
    correct: area.correct,
    fill: areaConfig[area.area]?.color || "hsl(var(--primary))",
  }))

  const hasData = stats.questionsAnswered > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-5" />
          Desempenho em Simulados
        </CardTitle>
        <CardDescription>
          Estatísticas baseadas nas questões respondidas nos seus simulados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <CheckCircle2 className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questões resolvidas</p>
                <p className="text-2xl font-bold">{stats.questionsAnswered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2">
                <Target className="size-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de acerto</p>
                <p className="text-2xl font-bold">
                  {hasData ? `${stats.accuracyRate}%` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/10 p-2">
                <Flame className="size-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sequência atual</p>
                <p className="text-2xl font-bold">
                  {stats.currentStreak > 0 ? (
                    <>
                      {stats.currentStreak} {stats.currentStreak === 1 ? "dia" : "dias"}
                    </>
                  ) : (
                    "-"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Desempenho por Área
          </CardTitle>
          <CardDescription>
            Taxa de acerto em cada área do conhecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 0, right: 20 }}
                accessibilityLayer
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="area"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {value}% de acerto
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.payload.correct} de {item.payload.total} questões
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="accuracyRate"
                  radius={[0, 4, 4, 0]}
                  fill="var(--color-accuracyRate)"
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-center">
              <div>
                <TrendingUp className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Responda questões nos simulados para ver seu desempenho por área
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </CardContent>
    </Card>
  )
}

function UserStatisticsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
