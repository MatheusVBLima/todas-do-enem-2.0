"use server"

import { generateObject, streamText } from "ai"
import { createStreamableValue } from "@ai-sdk/rsc"
import { geminiModel } from "@/lib/ai"
import { z } from "zod"
import type { QuestionWithExam } from "@/types"

export async function generateQuestionExplanation(question: QuestionWithExam) {
  const stream = createStreamableValue("")

  ;(async () => {
    const system = `Você é um especialista em questões do ENEM. Sua tarefa é explicar questões de forma clara e didática.

Forneça uma explicação estruturada em **markdown** com:

## 📚 Análise da Questão
Contextualize brevemente o tema e o que está sendo cobrado.

## ✅ Por que a alternativa correta está certa?
Explique o raciocínio passo a passo que leva à resposta correta.

## ⚠️ Erros Comuns
Mencione armadilhas ou confusões frequentes que estudantes cometem.

Use **negrito** para destacar conceitos-chave, *itálico* para ênfase, e listas quando apropriado. Seja conciso mas completo. Use português do Brasil.`

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

    const { textStream } = streamText({
      model: geminiModel,
      system,
      prompt,
      temperature: 0.7,
    })

    for await (const delta of textStream) {
      stream.update(delta)
    }

    stream.done()
  })()

  return { output: stream.value }
}

const essayFeedbackSchema = z.object({
  competencia1: z.object({
    nome: z.literal("Domínio da Norma Culta"),
    pontuacao: z.number().min(0).max(200),
    feedback: z.string(),
  }),
  competencia2: z.object({
    nome: z.literal("Compreensão da Proposta"),
    pontuacao: z.number().min(0).max(200),
    feedback: z.string(),
  }),
  competencia3: z.object({
    nome: z.literal("Seleção e Organização de Informações"),
    pontuacao: z.number().min(0).max(200),
    feedback: z.string(),
  }),
  competencia4: z.object({
    nome: z.literal("Coerência e Coesão"),
    pontuacao: z.number().min(0).max(200),
    feedback: z.string(),
  }),
  competencia5: z.object({
    nome: z.literal("Proposta de Solução"),
    pontuacao: z.number().min(0).max(200),
    feedback: z.string(),
  }),
  pontuacaoTotal: z.number().min(0).max(1000),
  feedbackGeral: z.string(),
})

export type EssayFeedback = z.infer<typeof essayFeedbackSchema>

export async function correctEssay(essayText: string, theme: string) {
  try {
    const system = `Você é um avaliador de redações do ENEM. Avalie redações baseado nas 5 competências oficiais:

1. Domínio da Norma Culta (0-200 pontos)
2. Compreensão da Proposta (0-200 pontos)
3. Seleção e Organização de Informações (0-200 pontos)
4. Coerência e Coesão (0-200 pontos)
5. Proposta de Solução (0-200 pontos)

Para cada competência, forneça:
- Pontuação de 0 a 200
- Feedback construtivo e específico

Seja criterioso mas justo. Use português do Brasil.`

    const prompt = `Tema: "${theme}"

Redação para avaliar:
${essayText}

Avalie esta redação de acordo com os critérios do ENEM e forneça feedback detalhado para cada competência com pontuações específicas.`

    const { object } = await generateObject({
      model: geminiModel,
      system,
      prompt,
      schema: essayFeedbackSchema,
      temperature: 0.5,
    })

    return { success: true, data: object }
  } catch (error) {
    console.error("Error correcting essay:", error)
    return { success: false, error: "Erro ao corrigir redação" }
  }
}
