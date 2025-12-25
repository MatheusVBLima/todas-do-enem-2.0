"use client"

import { useState } from "react"
import { Brain, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { QuestionWithExam } from "@/types"
import { toast } from "sonner"
import { DEV_USER } from "@/lib/dev-user"
import { Streamdown } from "streamdown"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"

type AIExplanationProps = {
  question: QuestionWithExam
}

export function AIExplanation({ question }: AIExplanationProps) {
  const isPro = DEV_USER.plan === "RUMO_A_APROVACAO"
  const [isGenerating, setIsGenerating] = useState(false)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (err) => {
      console.error("Error generating explanation:", err)
      toast.error("Erro ao gerar explicação")
      setIsGenerating(false)
    },
    onFinish: () => {
      toast.success("Explicação gerada com sucesso!")
      setIsGenerating(false)
    },
  })

  const handleGenerate = async () => {
    if (!isPro) {
      toast.error("Recurso disponível apenas no plano PRO")
      return
    }

    setIsGenerating(true)

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

  // Extrair o texto completo da mensagem
  const explanationText = assistantMessage?.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("") || ""

  return (
    <div className="space-y-4">
      {!showExplanation ? (
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Brain className="mr-2 size-4" />
          )}
          {isLoading ? "Gerando explicação..." : "Gerar Explicação com IA"}
          {isPro && <Badge variant="outline" className="ml-2">PRO</Badge>}
        </Button>
      ) : (
        <>
          {isGenerating && !explanationText ? (
            <Reasoning isStreaming={true} defaultOpen={false}>
              <ReasoningTrigger
                getThinkingMessage={() => "Analisando questão e gerando explicação..."}
              />
            </Reasoning>
          ) : explanationText ? (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Fechar explicação
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  )
}
