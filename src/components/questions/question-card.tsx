"use client"

import { useState } from "react"
import { Eye, EyeOff, FolderPlus, Brain, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { capitalizeSentences } from "@/lib/text-utils"
import { KNOWLEDGE_AREAS, SUBJECTS, ANSWER_OPTIONS, type KnowledgeAreaKey, type SubjectKey } from "@/lib/constants"
import type { QuestionWithExam } from "@/types"
import { AddToGroupButton } from "@/components/groups/add-to-group-button"
import { AIExplanation } from "./ai-explanation"

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
}

export function QuestionCard({ question, showAnswer = false, onRemove }: QuestionCardProps) {
  const [isAnswerVisible, setIsAnswerVisible] = useState(showAnswer)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const area = KNOWLEDGE_AREAS[question.knowledgeArea as KnowledgeAreaKey]
  const subject = SUBJECTS[question.subject as SubjectKey]

  // Parse supporting materials if available
  const supportingMaterials: SupportingMaterial[] = question.supportingMaterials
    ? JSON.parse(question.supportingMaterials)
    : []

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
          <div className="flex items-center gap-1">
            <AddToGroupButton questionId={question.id} variant="default" size="sm" />
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsAnswerVisible(true)}
              title="Ver explicação por IA"
            >
              <Brain className="mr-1.5 size-4" />
              IA
            </Button>
            {onRemove && (
              <>
                <div className="mx-2 h-6 w-px bg-border" />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={onRemove}
                  title="Remover do grupo"
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
                    <p className={cn(!isExpanded && "line-clamp-6", "whitespace-pre-line")}>
                      {capitalizeSentences(material.content)}
                    </p>
                    {material.metadata?.source && (
                      <p className="text-xs text-muted-foreground italic">
                        {material.metadata.source}
                      </p>
                    )}
                    {material.content.length > 300 && (
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
                    <div className="relative w-full overflow-hidden rounded-md">
                      <Image
                        src={material.url}
                        alt={material.alt || 'Imagem da questão'}
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

        {/* Legacy Context (for backward compatibility) */}
        {question.context && !supportingMaterials.length && (
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p className={cn(!isExpanded && "line-clamp-3")}>
              {capitalizeSentences(question.context)}
            </p>
            {question.context.length > 200 && (
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
            const isCorrectOption = option.letter === question.correctAnswer
            const showCorrect = isAnswerVisible && isCorrectOption
            const showWrong = isAnswerVisible && isSelected && !isCorrectOption

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
              variant="outline"
              size="sm"
              onClick={handleRevealAnswer}
              disabled={!hasAnswered}
            >
              <Eye className="mr-2 size-4" />
              {hasAnswered ? "Ver Gabarito" : "Selecione uma opção"}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {hasAnswered && (
                <Badge variant={isCorrect ? "default" : "destructive"}>
                  {isCorrect ? "Correto!" : "Incorreto"}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Resposta: <strong>{question.correctAnswer}</strong>
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedOption(null)
              setIsAnswerVisible(false)
            }}
          >
            Refazer
          </Button>
        </div>

        {/* AI Explanation */}
        {isAnswerVisible && <AIExplanation question={question} />}
      </CardContent>
    </Card>
  )
}
