"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Target, Loader2, Trophy } from "lucide-react"
import { toast } from "sonner"
import { getDailyGoalProgress, updateDailyGoal } from "@/server/actions/daily-goal"
import { cn } from "@/lib/utils"

interface DailyGoalCardProps {
  userId: string
}

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 50]

export function DailyGoalCard({ userId }: DailyGoalCardProps) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data: progress, isLoading } = useQuery({
    queryKey: ["daily-goal-progress", userId],
    queryFn: async () => {
      const result = await getDailyGoalProgress(userId)
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always', // Always refetch when component mounts
  })

  const updateMutation = useMutation({
    mutationFn: async (goal: number) => {
      const result = await updateDailyGoal(userId, goal)
      if (!result.success) throw new Error(result.error)
    },
    onSuccess: () => {
      toast.success("Meta diária atualizada!")
      queryClient.invalidateQueries({ queryKey: ["daily-goal-progress", userId] })
      setIsEditing(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar meta")
    },
  })

  if (isLoading) {
    return <DailyGoalCardSkeleton />
  }

  if (!progress) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5" />
              Meta Diária
            </CardTitle>
            <CardDescription>
              Questões respondidas em simulados por dia
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione sua meta diária de questões:
            </p>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((goal) => (
                <Button
                  key={goal}
                  variant={progress.goal === goal ? "default" : "outline"}
                  size="sm"
                  disabled={updateMutation.isPending}
                  onClick={() => updateMutation.mutate(goal)}
                  className="min-w-16"
                >
                  {updateMutation.isPending && updateMutation.variables === goal ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    goal
                  )}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <>
            {/* Progress Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso de hoje</span>
                <span className="font-medium">
                  {progress.answered} / {progress.goal} questões
                </span>
              </div>
              <Progress
                value={progress.percentage}
                className={cn("h-3", progress.isCompleted && "bg-green-100")}
              />
            </div>

            {/* Completion Status */}
            {progress.isCompleted ? (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                <Trophy className="size-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-300">
                    Meta atingida!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Parabéns! Você completou sua meta de hoje.
                  </p>
                </div>
              </div>
            ) : progress.answered > 0 ? (
              <p className="text-sm text-muted-foreground">
                Faltam <span className="font-medium">{progress.goal - progress.answered}</span> questões para atingir sua meta de hoje.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Responda questões nos simulados para acompanhar seu progresso.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function DailyGoalCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3 w-full" />
        </div>
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  )
}
