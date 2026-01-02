"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Check,
  AlertTriangle,
  Send,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { capitalizeSentences } from "@/lib/text-utils"
import { KNOWLEDGE_AREAS, SUBJECTS, type KnowledgeAreaKey, type SubjectKey } from "@/lib/constants"
import { queryKeys } from "@/lib/query-keys"
import { getSimuladoSession, submitAnswer, finishSimulado, abandonSimulado } from "@/server/actions/simulados"
import type { AnswerOption, SimuladoWithQuestions } from "@/types"

interface SupportingMaterial {
  type: "text" | "image"
  content?: string
  url?: string
  alt?: string
  caption?: string
  metadata?: {
    source?: string
  }
}

interface SimuladoSessionClientProps {
  simuladoId: string
}

export function SimuladoSessionClient({ simuladoId }: SimuladoSessionClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Fetch simulado data
  const { data: result } = useSuspenseQuery({
    queryKey: queryKeys.simulados.session(simuladoId),
    queryFn: () => getSimuladoSession(simuladoId),
  })

  const simulado = result.data as SimuladoWithQuestions

  // State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, AnswerOption>>(
    new Map(
      simulado.questions
        .filter((q) => q.userAnswer)
        .map((q) => [q.questionId, q.userAnswer as AnswerOption])
    )
  )
  const [timeLeft, setTimeLeft] = useState<number | null>(
    simulado.timeLimit ? simulado.timeLimit * 60 : null
  )
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [showAbandonDialog, setShowAbandonDialog] = useState(false)
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const currentQuestion = simulado.questions[currentIndex]
  const totalQuestions = simulado.questions.length
  const answeredCount = answers.size
  const progress = (answeredCount / totalQuestions) * 100

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return

    if (timeLeft <= 0) {
      setShowTimeUpDialog(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  // Handle answer selection
  const handleSelectAnswer = useCallback(
    (answer: AnswerOption) => {
      const questionId = currentQuestion.questionId

      // Update local state immediately
      setAnswers((prev) => new Map(prev).set(questionId, answer))

      // Submit to server
      startTransition(async () => {
        await submitAnswer({
          simuladoId,
          questionId,
          answer,
        })
      })
    },
    [currentQuestion?.questionId, simuladoId]
  )

  // Navigation
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index)
      setIsExpanded(false)
    }
  }

  const goToPrev = () => goToQuestion(currentIndex - 1)
  const goToNext = () => goToQuestion(currentIndex + 1)

  // Finish simulado
  const handleFinish = async () => {
    setShowFinishDialog(false)

    const timeTaken = simulado.timeLimit
      ? simulado.timeLimit * 60 - (timeLeft || 0)
      : undefined

    startTransition(async () => {
      const result = await finishSimulado(simuladoId, timeTaken)
      if (result.success) {
        router.push(`/simulados/${simuladoId}`)
      }
    })
  }

  // Abandon simulado
  const handleAbandon = async () => {
    setShowAbandonDialog(false)

    startTransition(async () => {
      await abandonSimulado(simuladoId)
      router.push("/simulados")
    })
  }

  // Time up - auto finish
  const handleTimeUp = async () => {
    setShowTimeUpDialog(false)

    const timeTaken = simulado.timeLimit ? simulado.timeLimit * 60 : undefined

    startTransition(async () => {
      const result = await finishSimulado(simuladoId, timeTaken)
      if (result.success) {
        router.push(`/simulados/${simuladoId}`)
      }
    })
  }

  // Render question content
  const question = currentQuestion.question
  const area = KNOWLEDGE_AREAS[question.knowledgeArea as KnowledgeAreaKey]
  const subject = SUBJECTS[question.subject as SubjectKey]
  const selectedAnswer = answers.get(currentQuestion.questionId)

  const supportingMaterials: SupportingMaterial[] = Array.isArray(question.supportingMaterials)
    ? (question.supportingMaterials as unknown as SupportingMaterial[])
    : typeof question.supportingMaterials === "string"
      ? JSON.parse(question.supportingMaterials)
      : []

  const options = [
    { letter: "A" as AnswerOption, text: capitalizeSentences(question.optionA) },
    { letter: "B" as AnswerOption, text: capitalizeSentences(question.optionB) },
    { letter: "C" as AnswerOption, text: capitalizeSentences(question.optionC) },
    { letter: "D" as AnswerOption, text: capitalizeSentences(question.optionD) },
    { letter: "E" as AnswerOption, text: capitalizeSentences(question.optionE) },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold truncate max-w-[200px] sm:max-w-none">
              {simulado.name}
            </h1>
            <Badge variant="outline">
              {currentIndex + 1} / {totalQuestions}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-sm",
                  timeLeft <= 300
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted"
                )}
              >
                <Clock className="size-4" />
                {formatTime(timeLeft)}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAbandonDialog(true)}
              disabled={isPending}
            >
              <X className="size-4 mr-2" />
              <span className="hidden sm:inline">Abandonar</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setShowFinishDialog(true)}
              disabled={isPending}
            >
              <Send className="size-4 mr-2" />
              <span className="hidden sm:inline">Finalizar</span>
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Main content */}
      <div className="container py-6 max-w-4xl">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                style={{ borderColor: area?.color, color: area?.color }}
              >
                {area?.shortLabel}
              </Badge>
              <Badge variant="secondary">{subject?.label}</Badge>
              <Badge variant="outline">{question.exam.year}</Badge>
              <span className="text-sm text-muted-foreground">
                Questão {question.questionNumber}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Supporting Materials */}
            {supportingMaterials.length > 0 && (
              <div className="space-y-3">
                {supportingMaterials.map((material, index) => (
                  <div key={index}>
                    {material.type === "text" && material.content && (
                      <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                        <p
                          className={cn(
                            !isExpanded && "line-clamp-6",
                            "whitespace-pre-line"
                          )}
                        >
                          {capitalizeSentences(material.content)}
                        </p>
                        {material.metadata?.source && (
                          <p className="text-xs text-muted-foreground italic">
                            {material.metadata.source}
                          </p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-auto p-0 text-primary"
                          onClick={() => setIsExpanded(!isExpanded)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="mr-1 size-4" />
                              Ver menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-1 size-4" />
                              Ver mais
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    {material.type === "image" && material.url && (
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="relative w-full overflow-hidden rounded-md">
                          <Image
                            src={material.url}
                            alt={material.alt || "Imagem da questão"}
                            width={800}
                            height={600}
                            className="w-full h-auto object-contain"
                            unoptimized
                          />
                        </div>
                        {material.caption && (
                          <p className="mt-2 text-xs text-muted-foreground italic text-center">
                            {material.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Legacy Context */}
            {question.context && !supportingMaterials.length && (
              <div className="rounded-lg bg-muted/50 p-4 text-sm">
                <p className={cn(!isExpanded && "line-clamp-3")}>
                  {capitalizeSentences(question.context)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto p-0 text-primary"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="mr-1 size-4" />
                      Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 size-4" />
                      Ver mais
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Statement */}
            <p className="font-medium">{capitalizeSentences(question.statement)}</p>

            {/* Options */}
            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.letter}
                  onClick={() => handleSelectAnswer(option.letter)}
                  disabled={isPending}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    "hover:bg-muted/50",
                    selectedAnswer === option.letter &&
                      "border-primary bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                      selectedAnswer === option.letter &&
                        "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {option.letter}
                  </span>
                  <span className="flex-1 text-sm">{option.text}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={goToPrev}
            disabled={currentIndex === 0 || isPending}
          >
            <ChevronLeft className="size-4 mr-2" />
            Anterior
          </Button>

          <div className="flex flex-wrap gap-1 max-w-md justify-center">
            {simulado.questions.map((q, idx) => {
              const hasAnswer = answers.has(q.questionId)
              const isCurrent = idx === currentIndex

              return (
                <button
                  key={q.questionId}
                  onClick={() => goToQuestion(idx)}
                  className={cn(
                    "size-8 rounded text-xs font-medium transition-colors",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : hasAnswer
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <Button
            variant="outline"
            onClick={goToNext}
            disabled={currentIndex === totalQuestions - 1 || isPending}
          >
            Próxima
            <ChevronRight className="size-4 ml-2" />
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Check className="size-4 text-green-500" />
            {answeredCount} respondidas
          </div>
          <div className="flex items-center gap-1">
            <Flag className="size-4 text-muted-foreground" />
            {totalQuestions - answeredCount} restantes
          </div>
        </div>
      </div>

      {/* Finish Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Simulado?</DialogTitle>
            <DialogDescription>
              Você respondeu {answeredCount} de {totalQuestions} questões.
              {totalQuestions - answeredCount > 0 && (
                <span className="block mt-2 text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="inline size-4 mr-1" />
                  Ainda há {totalQuestions - answeredCount} questões não
                  respondidas.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              Continuar
            </Button>
            <Button onClick={handleFinish} disabled={isPending}>
              {isPending ? "Finalizando..." : "Finalizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Abandon Dialog */}
      <AlertDialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abandonar Simulado?</AlertDialogTitle>
            <AlertDialogDescription>
              Seu progresso será perdido e este simulado será marcado como
              abandonado. Você não poderá retomá-lo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAbandon}
              className="bg-destructive hover:bg-destructive/90"
            >
              Abandonar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Up Dialog */}
      <Dialog open={showTimeUpDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="size-5 text-destructive" />
              Tempo Esgotado!
            </DialogTitle>
            <DialogDescription>
              O tempo do seu simulado acabou. Suas respostas serão salvas e o
              simulado será finalizado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleTimeUp} disabled={isPending} className="w-full">
              {isPending ? "Finalizando..." : "Ver Resultado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
