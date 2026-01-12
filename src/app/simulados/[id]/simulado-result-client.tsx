"use client"

import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  BarChart3,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { capitalizeSentences } from "@/lib/text-utils"
import { KNOWLEDGE_AREAS, type KnowledgeAreaKey } from "@/lib/constants"
import { queryKeys } from "@/lib/query-keys"
import { getSimuladoResult } from "@/server/actions/simulados"
import type { SimuladoWithQuestions, SimuladoResultado } from "@/types"

interface SupportingMaterial {
  type: "text" | "image"
  content?: string
  url?: string
  alt?: string
  caption?: string
}

interface SimuladoResultClientProps {
  simuladoId: string
}

export function SimuladoResultClient({ simuladoId }: SimuladoResultClientProps) {
  const [showQuestions, setShowQuestions] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const { data: result } = useSuspenseQuery({
    queryKey: queryKeys.simulados.result(simuladoId),
    queryFn: () => getSimuladoResult(simuladoId),
  })

  const simulado = result.data as SimuladoWithQuestions & { resultado: SimuladoResultado | null }
  const resultado = simulado.resultado

  if (!resultado) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Resultado não disponível.</p>
            <Button asChild className="mt-4">
              <Link href="/simulados">Voltar ao Histórico</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes} minutos`
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Summary Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Score Card */}
        <Card className="md:col-span-2 overflow-hidden border-none bg-muted/30 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 h-full">
              <div className="space-y-4 text-center sm:text-left">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{simulado.name}</h2>
                  <p className="text-muted-foreground font-medium mt-1">
                    {simulado.totalQuestions} questões finalizadas
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <Badge variant="outline" className="bg-background/50 font-bold px-3 py-1">
                    <Clock className="size-3.5 mr-1.5 text-primary" />
                    {resultado.timeTaken ? formatTime(resultado.timeTaken) : "--"}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    "font-bold px-3 py-1",
                    simulado.status === "CONCLUIDO" ? "text-green-600 bg-green-500/10" : "text-yellow-600 bg-yellow-500/10"
                  )}>
                    {simulado.status === "CONCLUIDO" ? "Concluído" : "Parcial"}
                  </Badge>
                </div>
              </div>

              <div className="relative flex items-center justify-center size-32">
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <span className={cn(
                    "font-black",
                    resultado.totalScore === 100 ? "text-2xl" : "text-4xl",
                    getScoreColor(resultado.totalScore)
                  )}>
                    {resultado.totalScore}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Score</span>
                </div>
                {/* Circular progress SVG */}
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className={cn(
                      resultado.totalScore >= 80 ? "text-green-500" :
                      resultado.totalScore >= 60 ? "text-yellow-500" :
                      resultado.totalScore >= 40 ? "text-orange-500" : "text-red-500"
                    )}
                    stroke="currentColor"
                    strokeDasharray={`${resultado.totalScore * 2.64} 264`}
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="border-none bg-green-500/5 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-green-600/80 uppercase tracking-wider">Corretas</p>
                <p className="text-2xl font-black text-green-600">{resultado.correctAnswers}</p>
              </div>
              <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                <CheckCircle2 className="size-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-red-500/5 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-red-600/80 uppercase tracking-wider">Erradas</p>
                <p className="text-2xl font-black text-red-600">{resultado.wrongAnswers}</p>
              </div>
              <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
                <XCircle className="size-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-muted shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Em branco</p>
                <p className="text-2xl font-black">{resultado.unansweredQuestions}</p>
              </div>
              <div className="size-10 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                <MinusCircle className="size-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Score by Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center h-10 px-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Desempenho por Área
            </h3>
          </div>
          
          <Card className="h-fit border-none bg-muted/30 shadow-none">
            <CardContent className="p-6 space-y-5">
              {Object.entries(resultado.scoreByArea).map(([area, stats]) => {
                const areaInfo = KNOWLEDGE_AREAS[area as KnowledgeAreaKey]
                return (
                  <div key={area} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                        {areaInfo?.label || area}
                      </span>
                      <span className="text-xs font-black">
                        {stats.correct}/{stats.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500" 
                          style={{ 
                            width: `${stats.percentage}%`,
                            backgroundColor: areaInfo?.color || "#888" 
                          }} 
                        />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{stats.percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Questions Review */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between h-10 px-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Eye className="size-5 text-primary" />
              Revisão das Questões
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="font-bold text-[10px] uppercase tracking-widest h-8"
              onClick={() => setShowQuestions(!showQuestions)}
            >
              {showQuestions ? (
                <>Recolher tudo</>
              ) : (
                <>Expandir tudo</>
              )}
            </Button>
          </div>

          {showQuestions ? (
            <div className="space-y-3">
              {simulado.questions.map((sq, idx) => {
                const question = sq.question
                const isExpanded = expandedQuestions.has(sq.questionId)
                const isCorrect = sq.isCorrect
                const wasAnswered = sq.userAnswer !== null

                const supportingMaterials: SupportingMaterial[] = Array.isArray(
                  question.supportingMaterials
                )
                  ? (question.supportingMaterials as unknown as SupportingMaterial[])
                  : []

                const options = [
                  { letter: "A", text: question.optionA },
                  { letter: "B", text: question.optionB },
                  { letter: "C", text: question.optionC },
                  { letter: "D", text: question.optionD },
                  { letter: "E", text: question.optionE },
                ]

                return (
                  <Collapsible
                    key={sq.questionId}
                    open={isExpanded}
                    onOpenChange={() => toggleQuestion(sq.questionId)}
                    className={cn(
                      "rounded-xl border transition-all overflow-hidden",
                      isExpanded ? "ring-1 ring-primary/20 shadow-md" : "hover:bg-muted/30"
                    )}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between p-4 text-left">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <span className="text-xs font-black text-muted-foreground w-6">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div
                            className={cn(
                              "size-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                              isCorrect
                                ? "bg-green-500 text-white"
                                : wasAnswered
                                  ? "bg-red-500 text-white"
                                  : "bg-muted text-muted-foreground"
                            )}
                          >
                            {isCorrect ? (
                              <CheckCircle2 className="size-4" />
                            ) : wasAnswered ? (
                              <XCircle className="size-4" />
                            ) : (
                              <MinusCircle className="size-4" />
                            )}
                          </div>
                          <span className="text-sm font-medium truncate">
                            {capitalizeSentences(question.statement)}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="size-4 shrink-0 ml-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-4 shrink-0 ml-4 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="p-6 bg-muted/10 border-t space-y-6">
                        {/* Supporting Materials */}
                        {supportingMaterials.length > 0 && (
                          <div className="space-y-4">
                            {supportingMaterials.map((material, mIdx) => (
                              <div key={mIdx}>
                                {material.type === "text" && material.content && (
                                  <div className="rounded-lg bg-background p-4 text-sm border shadow-sm italic leading-relaxed">
                                    <p className="whitespace-pre-line">
                                      {capitalizeSentences(material.content)}
                                    </p>
                                  </div>
                                )}
                                {material.type === "image" && material.url && (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <Image
                                      src={material.url}
                                      alt={material.alt || "Imagem contextual"}
                                      width={600}
                                      height={400}
                                      className="w-full h-auto object-contain rounded-md"
                                      unoptimized
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Statement */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase text-primary tracking-widest">Enunciado</p>
                          <p className="text-base font-semibold leading-relaxed">
                            {capitalizeSentences(question.statement)}
                          </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Alternativas</p>
                          <div className="grid gap-2">
                            {options.map((option) => {
                              const isUserAnswer = sq.userAnswer === option.letter
                              const isCancelled = question.correctAnswer === 'ANULADA'
                              const isCorrectAnswer = !isCancelled && question.correctAnswer === option.letter

                              return (
                                <div
                                  key={option.letter}
                                  className={cn(
                                    "group flex items-start gap-4 rounded-xl border p-4 transition-all",
                                    isCorrectAnswer && "border-green-500/50 bg-green-500/5 shadow-sm",
                                    isUserAnswer && !isCorrectAnswer && !isCancelled && "border-red-500/50 bg-red-500/5"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-black transition-colors",
                                      isCorrectAnswer && "border-green-500 bg-green-500 text-white",
                                      isUserAnswer && !isCorrectAnswer && !isCancelled && "border-red-500 bg-red-500 text-white",
                                      !isCorrectAnswer && !isUserAnswer && "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {option.letter}
                                  </div>
                                  <div className="flex-1 text-sm font-medium pt-0.5">
                                    {capitalizeSentences(option.text)}
                                  </div>
                                  {isCorrectAnswer && (
                                    <div className="size-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                      <CheckCircle2 className="size-4" />
                                    </div>
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && !isCancelled && (
                                    <div className="size-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
                                      <XCircle className="size-4" />
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {question.correctAnswer === 'ANULADA' && (
                          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 flex items-center gap-2 text-yellow-700 dark:text-yellow-500 text-xs font-bold uppercase">
                            <AlertCircle className="size-4" />
                            Questão Anulada - Todos recebem pontuação
                          </div>
                        )}

                        {!wasAnswered && question.correctAnswer !== 'ANULADA' && (
                          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 flex items-center gap-2 text-yellow-700 dark:text-yellow-500 text-xs font-bold uppercase">
                            <AlertCircle className="size-4" />
                            Você não respondeu esta questão
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed bg-transparent cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setShowQuestions(true)}>
              <CardContent className="p-8 text-center space-y-2">
                <Eye className="size-8 mx-auto text-muted-foreground opacity-50" />
                <p className="font-bold text-muted-foreground">Clique para revisar todas as questões</p>
                <p className="text-xs text-muted-foreground/60">Você poderá ver quais acertou e errou detalhadamente</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Final Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t">
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-bold">
          <Link href="/simulados">
            <ArrowLeft className="size-4 mr-2" />
            Voltar ao Histórico
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-primary/20">
          <Link href="/">
            Novo Simulado
          </Link>
        </Button>
      </div>
    </div>
  )
}
