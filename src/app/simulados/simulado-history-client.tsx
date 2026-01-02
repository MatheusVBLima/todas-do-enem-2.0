"use client"

import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Clock,
  Trophy,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  ClipboardList,
  Calendar,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { queryKeys } from "@/lib/query-keys"
import { getSimulados } from "@/server/actions/simulados"
import type { SimuladoWithResult } from "@/types"

interface SimuladoHistoryClientProps {
  userId: string
  initialPage: number
}

export function SimuladoHistoryClient({
  userId,
  initialPage,
}: SimuladoHistoryClientProps) {
  const router = useRouter()
  const [page, setPage] = useState(initialPage)

  const { data } = useSuspenseQuery({
    queryKey: queryKeys.simulados.list(userId),
    queryFn: () => getSimulados(userId, page),
  })

  const { data: simulados, pagination } = data

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    router.push(`/simulados?pagina=${newPage}`)
  }

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONCLUIDO":
        return (
          <Badge variant="default" className="bg-green-500">
            Concluído
          </Badge>
        )
      case "EM_ANDAMENTO":
        return (
          <Badge variant="secondary" className="bg-blue-500 text-white">
            Em Andamento
          </Badge>
        )
      case "ABANDONADO":
        return <Badge variant="destructive">Abandonado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  // Empty state
  if (simulados.length === 0) {
    return (
      <Empty className="border rounded-lg">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ClipboardList className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Nenhum simulado realizado</EmptyTitle>
          <EmptyDescription>
            Você ainda não fez nenhum simulado. Comece agora mesmo filtrando
            questões na página principal e clicando em &quot;Novo Simulado&quot;.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">
              <Play className="size-4 mr-2" />
              Ir para Questões
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-1">
      {/* Simulados List */}
      {simulados.map((simulado: SimuladoWithResult) => (
        <Card
          key={simulado.id}
          className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
          onClick={() => {
            if (simulado.status === "EM_ANDAMENTO") {
              router.push(`/simulados/${simulado.id}/sessao`)
            } else {
              router.push(`/simulados/${simulado.id}`)
            }
          }}
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row h-full">
              {/* Left Side: Main Info */}
              <div className="flex-1 p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-1">
                      {simulado.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-3.5" />
                      {formatDate(simulado.createdAt)}
                    </div>
                  </div>
                  {getStatusBadge(simulado.status)}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                    <ClipboardList className="size-4 text-primary" />
                    <span>{simulado.totalQuestions} questões</span>
                  </div>

                  {simulado.resultado?.timeTaken && (
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                      <Clock className="size-4 text-primary" />
                      <span>{formatTime(simulado.resultado.timeTaken)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Score/Stats (only if COMPLETED) */}
              {simulado.status === "CONCLUIDO" && simulado.resultado ? (
                <div className="sm:w-64 border-t sm:border-t-0 sm:border-l bg-muted/10 p-5 sm:p-6 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4">
                  <div className="text-center space-y-1">
                    <div
                      className={cn(
                        "text-4xl font-black tracking-tight",
                        getScoreColor(simulado.resultado.totalScore)
                      )}
                    >
                      {simulado.resultado.totalScore}%
                    </div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Aproveitamento
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                      <div className="size-8 rounded-full border-2 border-background bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400" title="Corretas">
                        <span className="text-xs font-bold">{simulado.resultado.correctAnswers}</span>
                      </div>
                      <div className="size-8 rounded-full border-2 border-background bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400" title="Erradas">
                        <span className="text-xs font-bold">{simulado.resultado.wrongAnswers}</span>
                      </div>
                    </div>
                    
                    <Trophy
                      className={cn(
                        "size-6 transition-transform group-hover:scale-110",
                        simulado.resultado.totalScore >= 80
                          ? "text-yellow-500"
                          : simulado.resultado.totalScore >= 60
                            ? "text-gray-400"
                            : "text-gray-300"
                      )}
                    />
                  </div>
                </div>
              ) : simulado.status === "EM_ANDAMENTO" ? (
                <div className="sm:w-64 border-t sm:border-t-0 sm:border-l bg-muted/10 p-5 sm:p-6 flex items-center justify-center">
                  <Button
                    className="w-full shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/simulados/${simulado.id}/sessao`)
                    }}
                  >
                    <Play className="size-4 mr-2 fill-current" />
                    Continuar
                  </Button>
                </div>
              ) : (
                <div className="sm:w-64 border-t sm:border-t-0 sm:border-l bg-muted/10 p-5 sm:p-6 flex items-center justify-center gap-2 text-muted-foreground italic">
                  <AlertCircle className="size-4" />
                  <span className="text-sm">Incompleto</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="size-4 mr-2" />
            Anterior
          </Button>

          <span className="px-4 text-sm text-muted-foreground">
            Página {page} de {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={!pagination.hasMore}
          >
            Próxima
            <ChevronRight className="size-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
