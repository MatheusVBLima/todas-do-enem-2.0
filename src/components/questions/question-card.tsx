"use client"

import { useState, startTransition, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Eye, ChevronDown, ChevronUp, Trash2, ExternalLink, Lock, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { capitalizeSentences } from "@/lib/text-utils"
import { KNOWLEDGE_AREAS, SUBJECTS, type KnowledgeAreaKey, type SubjectKey } from "@/lib/constants"
import type { QuestionWithExam } from "@/types"
import { AddToGroupButton } from "@/components/groups/add-to-group-button"
import { usePrefetchQuestion } from "@/hooks/use-prefetch-question"

// Dynamic import for AI Explanation - only loads when user requests explanation
const AIExplanation = dynamic(() => import("./ai-explanation").then(mod => mod.AIExplanation), {
  loading: () => (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  ),
  ssr: false,
})

interface SupportingMaterial {
  type: 'text' | 'image'
  content?: string
  url?: string
  alt?: string
  caption?: string
  imageType?: string
  metadata?: {
    source?: string
  }
}

interface QuestionCardProps {
  question: QuestionWithExam
  showAnswer?: boolean
  onRemove?: () => void
  userId?: string | null
  userPlan?: string | null
}

export function QuestionCard({ question, showAnswer = false, onRemove, userId = null, userPlan = null }: QuestionCardProps) {
  const router = useRouter()
  const [isAnswerVisible, setIsAnswerVisible] = useState(showAnswer)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const [isExpanded, setIsExpanded] = useState(false)
  const [showExpandButton, setShowExpandButton] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)
  const contextRef = useRef<HTMLParagraphElement>(null)
  const prefetchQuestion = usePrefetchQuestion()

  // Check if text is actually truncated
  useEffect(() => {
    const checkTruncation = () => {
      // Check supporting materials truncation
      if (textRef.current && !isExpanded) {
        const isTruncated = textRef.current.scrollHeight > textRef.current.clientHeight
        setShowExpandButton(isTruncated)
      }
      // Check legacy context truncation
      else if (contextRef.current && !isExpanded) {
        const isTruncated = contextRef.current.scrollHeight > contextRef.current.clientHeight
        setShowExpandButton(isTruncated)
      }
    }

    // Use setTimeout to ensure DOM is fully rendered
    const timer = setTimeout(checkTruncation, 0)

    // Recheck on window resize
    window.addEventListener('resize', checkTruncation)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkTruncation)
    }
  }, [question.supportingMaterials, question.context, isExpanded])

  const area = KNOWLEDGE_AREAS[question.knowledgeArea as KnowledgeAreaKey]
  const subject = SUBJECTS[question.subject as SubjectKey]

  // Parse supporting materials if available (JSONB is already parsed)
  const supportingMaterials: SupportingMaterial[] = Array.isArray(question.supportingMaterials)
    ? question.supportingMaterials as unknown as SupportingMaterial[]
    : (typeof question.supportingMaterials === 'string'
        ? JSON.parse(question.supportingMaterials)
        : [])

  const options = [
    { letter: "A", text: capitalizeSentences(question.optionA) },
    { letter: "B", text: capitalizeSentences(question.optionB) },
    { letter: "C", text: capitalizeSentences(question.optionC) },
    { letter: "D", text: capitalizeSentences(question.optionD) },
    { letter: "E", text: capitalizeSentences(question.optionE) },
  ]

  const handleOptionClick = (letter: string) => {
    if (isAnswerVisible) return
    setSelectedOption(letter)
  }

  const handleRevealAnswer = () => {
    setIsAnswerVisible(true)
  }

  const isCorrect = selectedOption === question.correctAnswer
  const hasAnswered = selectedOption !== null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              style={{ borderColor: area?.color, color: area?.color }}
            >
              {area?.shortLabel}
            </Badge>
            <Badge variant="secondary" className="max-[380px]:hidden">{subject?.label}</Badge>
            <Badge variant="outline" className="max-[380px]:hidden">{question.exam.year}</Badge>
            <Badge variant="outline" className="min-[381px]:hidden">{question.exam.year.toString().slice(2)}</Badge>
            <Button variant="default" size="sm" className="h-auto py-1 px-2" asChild>
              <Link
                href={`/${question.id}`}
                className="flex items-center gap-1"
                onMouseEnter={() => {
                  startTransition(() => {
                    prefetchQuestion(question.id)
                    router.prefetch(`/${question.id}`)
                  })
                }}
              >
                Q{question.questionNumber}
                <ExternalLink className="size-3" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <div className="hidden sm:contents">
              <AddToGroupButton questionId={question.id} userId={userId} variant="default" size="sm" />
            </div>
            <div className="sm:hidden">
              <AddToGroupButton questionId={question.id} userId={userId} variant="default" size="icon" />
            </div>
            {onRemove && (
              <>
                <div className="mx-2 h-6 w-px bg-border hidden sm:block" />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={onRemove}
                  aria-label="Remover do grupo"
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Supporting Materials */}
        {supportingMaterials.length > 0 && (
          <div className="space-y-3">
            {supportingMaterials.map((material, index) => (
              <div key={index}>
                {material.type === 'text' && material.content && (
                  <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                    <p
                      ref={textRef}
                      className={cn(!isExpanded && "line-clamp-6", "whitespace-pre-line")}
                    >
                      {capitalizeSentences(material.content)}
                    </p>
                    {material.metadata?.source && (
                      <p className="text-xs text-muted-foreground italic">
                        {material.metadata.source}
                      </p>
                    )}
                    {showExpandButton && (
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
                    )}
                  </div>
                )}
                {material.type === 'image' && material.url && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="relative w-full rounded-md">
                      <Image
                        src={material.url}
                        alt={material.alt || 'Imagem da questão'}
                        width={1200}
                        height={900}
                        className="w-full h-auto max-w-full"
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

        {/* Legacy Context (for backward compatibility) */}
        {question.context && !supportingMaterials.length && (
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p
              ref={contextRef}
              className={cn(!isExpanded && "line-clamp-3")}
            >
              {capitalizeSentences(question.context)}
            </p>
            {showExpandButton && (
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
            )}
          </div>
        )}

        {/* Statement */}
        <p className="font-medium">{capitalizeSentences(question.statement)}</p>

        {/* Options */}
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selectedOption === option.letter
            const isCancelled = question.correctAnswer === 'ANULADA'
            const isUnavailable = question.correctAnswer === 'X' || !question.correctAnswer
            const isCorrectOption = !isCancelled && !isUnavailable && option.letter === question.correctAnswer
            const showCorrect = isAnswerVisible && isCorrectOption
            const showWrong = isAnswerVisible && isSelected && !isCorrectOption && !isCancelled && !isUnavailable

            return (
              <button
                key={option.letter}
                onClick={() => handleOptionClick(option.letter)}
                disabled={isAnswerVisible}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  "hover:bg-muted/50 disabled:cursor-default disabled:hover:bg-transparent",
                  isSelected && !isAnswerVisible && "border-primary bg-primary/5",
                  showCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
                  showWrong && "border-red-500 bg-red-50 dark:bg-red-950/30"
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                    isSelected && !isAnswerVisible && "border-primary bg-primary text-primary-foreground",
                    showCorrect && "border-green-500 bg-green-500 text-white",
                    showWrong && "border-red-500 bg-red-500 text-white"
                  )}
                >
                  {option.letter}
                </span>
                <span className="flex-1 text-sm">{option.text}</span>
              </button>
            )
          })}
        </div>

        <Separator />

        {/* Answer Actions */}
        <div className="flex items-center justify-between">
          {!isAnswerVisible ? (
            <Button
              size="sm"
              onClick={handleRevealAnswer}
              disabled={!hasAnswered}
            >
              <Eye className="mr-2 size-4" />
              {hasAnswered ? "Ver Gabarito" : "Selecione uma opção"}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {question.correctAnswer === 'ANULADA' ? (
                <Badge variant="secondary" className="text-secondary-foreground">
                  Questão Anulada
                </Badge>
              ) : question.correctAnswer === 'X' || !question.correctAnswer ? (
                <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                  Gabarito indisponível
                </Badge>
              ) : (
                <>
                  {hasAnswered && (
                    <Badge variant={isCorrect ? "default" : "destructive"}>
                      {isCorrect ? "Correto!" : "Incorreto"}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Resposta: <strong>{question.correctAnswer}</strong>
                  </span>
                </>
              )}
            </div>
          )}

          <Button
            size="sm"
            onClick={() => {
              setSelectedOption(null)
              setIsAnswerVisible(false)
            }}
          >
            Refazer
          </Button>
        </div>

        {/* AI Explanation - shown after revealing answer */}
        {isAnswerVisible && (
          userId ? (
            <AIExplanation
              question={question}
              userId={userId}
              userPlan={userPlan}
            />
          ) : (
            <Button
              variant="default"
              size="sm"
              className="w-full"
              asChild
            >
              <Link href="/planos">
                <Sparkles className="mr-2 size-4" />
                Assine Rumo à Aprovação para ver a explicação com IA
              </Link>
            </Button>
          )
        )}
      </CardContent>
    </Card>
  )
}
