"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles, FileText, AlertCircle } from "lucide-react"
import { getUserQuota } from "@/lib/ai-quota"
import { Skeleton } from "@/components/ui/skeleton"
import { queryKeys } from "@/lib/query-keys"

interface QuotaDisplayProps {
  userId: string
  userPlan: string
  variant?: "full" | "compact"
}

export function QuotaDisplay({ userId, userPlan, variant = "full" }: QuotaDisplayProps) {
  const { data: quota, isLoading } = useQuery({
    queryKey: queryKeys.aiQuota.user(userId),
    queryFn: () => getUserQuota(userId, userPlan),
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always', // Always refetch when component mounts
  })

  if (isLoading) {
    if (variant === "compact") {
      return <Skeleton className="h-8 w-48" />
    }
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!quota) {
    return null
  }

  // Compact variant for sidebar
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="size-4" />
        <span>
          {quota.questionsRemaining} explicações • {quota.essaysRemaining} redações
        </span>
      </div>
    )
  }

  // Full variant for account page
  const questionsPercentage = (quota.questionsUsed / quota.questionsLimit) * 100
  const essaysPercentage = (quota.essaysUsed / quota.essaysLimit) * 100

  const renewalDate = quota.currentPeriodEnd.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5" />
          Uso de IA
        </CardTitle>
        <CardDescription>
          Limite mensal • Renova em {renewalDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Questions quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="font-medium">Explicações de Questões</span>
            </div>
            {!quota.hasQuestionQuota && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="size-3" />
                Limite atingido
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {quota.questionsUsed} de {quota.questionsLimit} usadas
              </span>
              <span>{quota.questionsRemaining} restantes</span>
            </div>
            <Progress value={questionsPercentage} className="h-2" />
          </div>
        </div>

        {/* Essays quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <span className="font-medium">Correções de Redação</span>
            </div>
            {!quota.hasEssayQuota && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="size-3" />
                Limite atingido
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {quota.essaysUsed} de {quota.essaysLimit} usadas
              </span>
              <span>{quota.essaysRemaining} restantes</span>
            </div>
            <Progress value={essaysPercentage} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
