"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { QuestionWithExam } from "@/types"
import { toast } from "sonner"
import { Streamdown } from "streamdown"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  Reasoning,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
import { UpgradeDialog } from "@/components/upgrade-dialog"

type AIExplanationProps = {
  question: QuestionWithExam
  userPlan: string | null
}

export function AIExplanation({ question, userPlan }: AIExplanationProps) {
  const isPro = userPlan === "RUMO_A_APROVACAO"
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (err) => {
      console.error("[AI-EXPLANATION] Error generating explanation:", err)

      if (err.message?.includes('exclusivo do plano') || err.message?.includes('403')) {
        setShowUpgradeDialog(true)
        toast.error("Este recurso é exclusivo do plano Rumo à Aprovação")
      } else {
        toast.error("Erro ao gerar explicação")
      }
    },
    onFinish: () => {
      toast.success("Explicação gerada com sucesso!")
    },
  })

  // Handle manual generation (when "Gerar Explicação com IA" is clicked)
  const handleGenerate = async () => {
    if (!isPro) {
      setShowUpgradeDialog(true)
      return
    }

    setHasGenerated(true)

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

    sendMessage({ text: prompt })
  }

  // If not generated yet, show button
  if (!hasGenerated) {
    return (
      <>
        <UpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          feature="ai-explanation"
        />

        <Button
          onClick={handleGenerate}
          variant="outline"
          className="w-full"
        >
          <Sparkles className="mr-2 size-4" />
          Gerar Explicação com IA
          {!isPro && <Badge variant="outline" className="ml-2">PRO</Badge>}
        </Button>
      </>
    )
  }

  // Extract text safely with proper null checking
  const assistantMessage = messages.find((m) => m.role === "assistant")
  const explanationText = assistantMessage?.parts
    ?.filter((part) => part.type === "text")
    ?.map((part) => part.text)
    .join("") || ""

  const isLoading = status === 'submitted' || (status === 'ready' && !explanationText)

  return (
    <div className="space-y-4">
      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        feature="ai-explanation"
      />

      {isLoading && !explanationText ? (
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
                onClick={() => setHasGenerated(false)}
              >
                Fechar explicação
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed p-4">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Gerando explicação...</span>
        </div>
      )}
    </div>
  )
}
