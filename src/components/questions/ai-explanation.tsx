"use client"

import { useState } from "react"
import { Loader2, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { QuestionWithExam } from "@/types"
import { toast } from "sonner"
import { Streamdown } from "streamdown"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useQueryClient } from "@tanstack/react-query"
import {
  Reasoning,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { ComingSoonDialog } from "@/components/coming-soon-dialog"
import { AdBanner } from "@/components/ad-banner"

type AIExplanationProps = {
  question: QuestionWithExam
  userId: string
  userPlan: string | null
}

export function AIExplanation({ question, userId, userPlan }: AIExplanationProps) {
  const isPro = userPlan === "RUMO_A_APROVACAO"

  const [isGenerating, setIsGenerating] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const queryClient = useQueryClient()

  // Check if explanation is cached
  const isCached = !!question.aiExplanation

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        questionId: question.id, // Send questionId for cache checking
      },
    }),
    onError: (err) => {
      console.error("Error generating explanation:", err)

      // Check if it's a permission error
      if (err.message?.includes('exclusivo do plano') || err.message?.includes('403')) {
        setShowUpgradeDialog(true)
        toast.error("Este recurso é exclusivo do plano Rumo à Aprovação")
      } else if (err.message?.includes('limite')) {
        toast.error(err.message, { duration: 5000 })
      } else {
        toast.error("Erro ao gerar explicação")
      }

      setIsGenerating(false)
    },
    onFinish: () => {
      toast.success(isCached ? "Explicação carregada!" : "Explicação gerada com sucesso!")
      setIsGenerating(false)

      // Invalidate quota to update UI
      queryClient.invalidateQueries({ queryKey: ["ai-quota", userId] })
    },
  })

  const handleGenerate = async () => {
    if (!isPro) {
      setShowUpgradeDialog(true)
      return
    }

    setIsGenerating(true)

    // Create the prompt for explanation
    const prompt = `Área: ${question.knowledgeArea}
Disciplina: ${question.subject}
Ano: ${question.exam.year}

${question.context ? `Contexto:\n${question.context}\n\n` : ""}Enunciado:
${question.statement}

Alternativas:
A) ${question.optionA}
B) ${question.optionB}
C) ${question.optionC}
D) ${question.optionD}
E) ${question.optionE}

Resposta correta: ${question.correctAnswer}

Explique esta questão do ENEM de forma didática.`

    await sendMessage({ text: prompt })
  }

  const assistantMessage = messages.find((m) => m.role === "assistant")
  const showExplanation = messages.length > 0
  const isLoading = status === "streaming"

  // Extract full text from message parts
  const explanationText = assistantMessage?.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("") || ""

  // If not generated yet, show button
  if (!showExplanation) {
    return (
      <>
        <ComingSoonDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          feature="ai-explanation"
        />

        <Button
          onClick={() => setShowUpgradeDialog(true)}
          disabled={false}
          variant="outline"
          className="w-full"
        >
          <Sparkles className="mr-2 size-4" />
          Explicação por IA - Em breve
        </Button>
      </>
    )
  }

  return (
    <div className="space-y-4">
      <ComingSoonDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        feature="ai-explanation"
      />

      {isGenerating && !explanationText ? (
        <Reasoning isStreaming={true} defaultOpen={false}>
          <ReasoningTrigger
            getThinkingMessage={() => (
              <Shimmer duration={1.5}>
                {isCached ? "Carregando explicação..." : "Analisando questão e gerando explicação..."}
              </Shimmer>
            )}
          />
        </Reasoning>
      ) : explanationText ? (
        isExpanded ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-primary" />
              Explicação por IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <Streamdown isAnimating={isLoading}>
                {explanationText}
              </Streamdown>
            </div>

            {!isLoading && (
              <>
                <AdBanner className="mt-6" />
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsExpanded(false)}
                >
                  Fechar explicação
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={() => setIsExpanded(true)}
          >
            <Sparkles className="mr-2 size-4" />
            Ver explicação
          </Button>
        )
      ) : null}
    </div>
  )
}
