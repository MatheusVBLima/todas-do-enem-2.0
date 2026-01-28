"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Minus, LineChart as LineChartIcon } from "lucide-react"
import { getUserPerformanceHistory } from "@/server/actions/statistics"
import { queryKeys } from "@/lib/query-keys"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface PerformanceEvolutionCardProps {
  userId: string
}

const chartConfig = {
  accuracyRate: {
    label: "Taxa de Acerto",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function getTrendInfo(data: { accuracyRate: number }[]) {
  if (data.length < 2) {
    return { icon: Minus, label: "Dados insuficientes", color: "text-muted-foreground" }
  }

  const lastTwo = data.slice(-2)
  const diff = lastTwo[1].accuracyRate - lastTwo[0].accuracyRate

  if (diff > 5) {
    return { icon: TrendingUp, label: `+${diff}% esta semana`, color: "text-green-600" }
  } else if (diff < -5) {
    return { icon: TrendingDown, label: `${diff}% esta semana`, color: "text-red-600" }
  }
  return { icon: Minus, label: "Estável", color: "text-yellow-600" }
}

export function PerformanceEvolutionCard({ userId }: PerformanceEvolutionCardProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: queryKeys.performanceHistory.user(userId),
    queryFn: async () => {
      const result = await getUserPerformanceHistory(userId)
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  })

  if (isLoading) {
    return <PerformanceEvolutionCardSkeleton />
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="size-5" />
            Evolução do Desempenho
          </CardTitle>
          <CardDescription>
            Acompanhe seu progresso ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <LineChartIcon className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground max-w-xs">
              Responda questões nos simulados para ver a evolução do seu desempenho.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const trend = getTrendInfo(history)
  const TrendIcon = trend.icon
  const averageAccuracy = Math.round(
    history.reduce((sum, h) => sum + h.accuracyRate, 0) / history.length
  )
  const totalQuestions = history.reduce((sum, h) => sum + h.total, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="size-5" />
              Evolução do Desempenho
            </CardTitle>
            <CardDescription className="mt-1">
              Últimas {history.length} semanas de estudo
            </CardDescription>
          </div>

          {/* Stats summary */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <TrendIcon className={`size-4 ${trend.color}`} />
              <span className={trend.color}>{trend.label}</span>
            </div>
            <div className="text-muted-foreground">
              Média: <span className="font-medium text-foreground">{averageAccuracy}%</span>
            </div>
            <div className="text-muted-foreground">
              Total: <span className="font-medium text-foreground">{totalQuestions} questões</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            data={history}
            margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(value) => value}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    if (payload?.[0]?.payload?.date) {
                      const date = new Date(payload[0].payload.date)
                      return `Semana de ${date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}`
                    }
                    return value
                  }}
                  formatter={(value, name, props) => {
                    if (name === "accuracyRate") {
                      const { correct, total } = props.payload
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-primary">{value}% de acerto</span>
                          <span className="text-muted-foreground text-xs">
                            {correct} acertos de {total} questões
                          </span>
                        </div>
                      )
                    }
                    return value
                  }}
                />
              }
            />
            <Bar
              dataKey="accuracyRate"
              fill="var(--color-accuracyRate)"
              radius={[4, 4, 0, 0]}
              barSize={40}
              label={{ 
                position: 'top', 
                formatter: (val: number) => `${val}%`,
                fill: "var(--foreground)",
                fontSize: 12,
                fontWeight: 600
              }}
            />
          </BarChart>
        </ChartContainer>

        {/* Weekly breakdown below chart */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {history.slice(-4).map((week) => (
            <div
              key={week.date}
              className="rounded-lg bg-muted/50 p-2 text-center"
            >
              <p className="text-xs text-muted-foreground">{week.week}</p>
              <p className="text-lg font-semibold">{week.accuracyRate}%</p>
              <p className="text-xs text-muted-foreground">
                {week.correct}/{week.total}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceEvolutionCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
