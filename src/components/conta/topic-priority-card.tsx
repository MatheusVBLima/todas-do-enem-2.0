"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, AlertTriangle, GraduationCap, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { getUserPerformanceByTopic } from "@/server/actions/statistics"
import { queryKeys } from "@/lib/query-keys"
import { KNOWLEDGE_AREAS, SUBJECTS, type KnowledgeAreaKey, type SubjectKey } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { UrgencyLevel, TopicPerformance } from "@/types"
import Link from "next/link"

interface TopicPriorityCardProps {
  userId: string
}

const URGENCY_CONFIG: Record<UrgencyLevel, {
  label: string
  variant: "destructive" | "secondary" | "outline" | "default"
  textColor: string
  value: number
}> = {
  CRITICAL: {
    label: "Crítico",
    variant: "destructive",
    textColor: "text-destructive",
    value: 4,
  },
  HIGH: {
    label: "Alto",
    variant: "secondary",
    textColor: "text-orange-600 dark:text-orange-400",
    value: 3,
  },
  MEDIUM: {
    label: "Médio",
    variant: "outline",
    textColor: "text-muted-foreground",
    value: 2,
  },
  LOW: {
    label: "Baixo",
    variant: "outline",
    textColor: "text-green-600 dark:text-green-400",
    value: 1,
  },
}

const AREA_OPTIONS = [
  { value: "ALL", label: "Todas as Áreas" },
  { value: "LINGUAGENS", label: "Linguagens" },
  { value: "CIENCIAS_HUMANAS", label: "Humanas" },
  { value: "CIENCIAS_NATUREZA", label: "Natureza" },
  { value: "MATEMATICA", label: "Matemática" },
]

const URGENCY_OPTIONS = [
  { value: "ALL", label: "Todos os Níveis" },
  { value: "CRITICAL", label: "Crítico" },
  { value: "HIGH", label: "Alto" },
  { value: "MEDIUM", label: "Médio" },
  { value: "LOW", label: "Baixo" },
]

function getTrendIcon(accuracyRate: number, total: number) {
  if (total < 3) return <Minus className="size-3 text-muted-foreground" />
  if (accuracyRate < 40) return <TrendingDown className="size-3 text-red-500" />
  if (accuracyRate >= 70) return <TrendingUp className="size-3 text-green-500" />
  return <Minus className="size-3 text-yellow-500" />
}

function getStudyUrl(topic: TopicPerformance): string {
  // Build URL for filtering questions by this specific topic
  return `/?topics=${encodeURIComponent(topic.topic)}`
}

export function TopicPriorityCard({ userId }: TopicPriorityCardProps) {
  const [areaFilter, setAreaFilter] = useState<string>("ALL")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL")

  const { data: topics, isLoading } = useQuery({
    queryKey: queryKeys.topicPerformance.user(userId),
    queryFn: async () => {
      const result = await getUserPerformanceByTopic(userId)
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  })

  // Filter topics based on selected filters
  const filteredTopics = useMemo(() => {
    if (!topics) return []

    return topics.filter(topic => {
      // Area filter
      if (areaFilter !== "ALL") {
        const areaKey = Object.keys(KNOWLEDGE_AREAS).find(key => {
          const area = KNOWLEDGE_AREAS[key as KnowledgeAreaKey]
          return area.label === topic.knowledgeArea || area.shortLabel === topic.knowledgeArea
        })
        if (areaKey !== areaFilter) return false
      }

      // Urgency filter
      if (urgencyFilter !== "ALL" && topic.urgencyLevel !== urgencyFilter) {
        return false
      }

      return true
    })
  }, [topics, areaFilter, urgencyFilter])

  // Stats summary
  const stats = useMemo(() => {
    if (!topics || topics.length === 0) return null

    const critical = topics.filter(t => t.urgencyLevel === "CRITICAL").length
    const high = topics.filter(t => t.urgencyLevel === "HIGH").length
    const medium = topics.filter(t => t.urgencyLevel === "MEDIUM").length
    const low = topics.filter(t => t.urgencyLevel === "LOW").length

    return { critical, high, medium, low, total: topics.length }
  }, [topics])

  if (isLoading) {
    return <TopicPriorityCardSkeleton />
  }

  const hasFilters = areaFilter !== "ALL" || urgencyFilter !== "ALL"

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              Prioridade de Estudo por Assunto
            </CardTitle>
            <CardDescription className="mt-1">
              Assuntos ordenados por urgência de estudo baseado nos simulados
            </CardDescription>
          </div>

          {/* Stats badges */}
          {stats && (
            <div className="flex flex-wrap gap-1.5">
              {stats.critical > 0 && (
                <Badge variant="destructive">
                  {stats.critical} crítico{stats.critical > 1 ? "s" : ""}
                </Badge>
              )}
              {stats.high > 0 && (
                <Badge variant="secondary">
                  {stats.high} alto{stats.high > 1 ? "s" : ""}
                </Badge>
              )}
              {stats.low > 0 && (
                <Badge variant="outline" className="text-green-600 dark:text-green-400">
                  {stats.low} dominado{stats.low > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        {topics && topics.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                {AREA_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Urgência" />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => {
                  setAreaFilter("ALL")
                  setUrgencyFilter("ALL")
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {!topics || topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground max-w-xs">
              Responda questões nos simulados para ver sua prioridade de estudo.
              As questões ainda estão sendo classificadas por assunto.
            </p>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Filter className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground max-w-xs">
              Nenhum assunto encontrado com os filtros selecionados.
            </p>
            <Button
              variant="link"
              size="sm"
              className="mt-2"
              onClick={() => {
                setAreaFilter("ALL")
                setUrgencyFilter("ALL")
              }}
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-xs text-muted-foreground mb-3">
              Mostrando {filteredTopics.length} de {topics.length} assunto{topics.length > 1 ? "s" : ""}
            </p>

            {/* Scrollable list with custom scrollbar */}
            <div className="max-h-[400px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
              {filteredTopics.map((topic, index) => {
                const urgency = URGENCY_CONFIG[topic.urgencyLevel]
                const subject = SUBJECTS[topic.subject as SubjectKey]
                const studyUrl = getStudyUrl(topic)

                return (
                  <div
                    key={`${topic.topic}-${index}`}
                    className="rounded-lg border bg-card p-3 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{topic.topic}</p>
                          {getTrendIcon(topic.accuracyRate, topic.total)}
                        </div>
                        <Badge variant="secondary" className="text-xs mt-1.5">
                          {subject?.label || topic.subject}
                        </Badge>
                      </div>
                      <Badge variant={urgency.variant} className="shrink-0">
                        {urgency.label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de acerto</span>
                      <span className={cn("font-medium tabular-nums", urgency.textColor)}>
                        {topic.accuracyRate}% ({topic.correct}/{topic.total})
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 text-xs"
                      asChild
                    >
                      <Link href={studyUrl}>
                        <GraduationCap className="size-3.5 mr-1.5" />
                        Estudar este assunto
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function TopicPriorityCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2 pt-3">
          <Skeleton className="h-8 w-[140px]" />
          <Skeleton className="h-8 w-[140px]" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
