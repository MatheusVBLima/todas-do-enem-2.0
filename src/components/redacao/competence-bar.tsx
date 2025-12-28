"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CompetenceBarProps {
  number: number
  label: string
  score: number
  maxScore?: number
  feedback: string
}

export function CompetenceBar({
  number,
  label,
  score,
  maxScore = 200,
  feedback,
}: CompetenceBarProps) {
  const percentage = (score / maxScore) * 100

  // Color based on score
  const getColor = () => {
    if (score >= 160) return "text-green-600 dark:text-green-400"
    if (score >= 120) return "text-yellow-600 dark:text-yellow-400"
    if (score >= 80) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getProgressColor = () => {
    if (score >= 160) return "[&>div]:bg-green-600"
    if (score >= 120) return "[&>div]:bg-yellow-600"
    if (score >= 80) return "[&>div]:bg-orange-600"
    return "[&>div]:bg-red-600"
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Competência {number}
          </CardTitle>
          <span className={`text-2xl font-bold ${getColor()}`}>
            {score}/{maxScore}
          </span>
        </div>
        <CardDescription className="text-sm">{label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percentage} className={getProgressColor()} />
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feedback}
        </p>
      </CardContent>
    </Card>
  )
}
