"use server"

import { generateObject, streamText } from "ai"
import { createStreamableValue } from "@ai-sdk/rsc"
import { geminiModel } from "@/lib/ai"
import { z } from "zod"
import type { QuestionWithExam } from "@/types"
import { calculateAICost } from "@/lib/ai-cost-calculator"
import { canGenerateExplanation, canCorrectEssay, recordAIUsage } from "@/lib/ai-quota"
import { supabase } from "@/lib/supabase/server"

interface GenerateExplanationParams {
  question: QuestionWithExam
  userId: string
  userPlan: string
}

/**
 * Generate question explanation with quota check and caching
 */
export async function generateQuestionExplanation(params: GenerateExplanationParams) {
  const { question, userId, userPlan } = params

  // STEP 1: Check if cached explanation exists (global cache)
  if (question.aiExplanation) {
    console.log(`[AI] Cache HIT for question ${question.id}`)

    // Log cache hit (0 tokens, 0 cost)
    await recordAIUsage({
      userId,
      type: 'QUESTION_EXPLANATION',
      resourceId: question.id,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostBRL: 0,
      cacheHit: true,
      status: 'SUCCESS',
    })

    // Return cached result immediately
    const stream = createStreamableValue("")
    stream.done(question.aiExplanation)
    return {
      output: stream.value,
      cached: true,
    }
  }

  // STEP 2: Check quota
  const quotaCheck = await canGenerateExplanation(userId, userPlan)

  if (!quotaCheck.allowed) {
    const stream = createStreamableValue("")
    stream.error(new Error(quotaCheck.error || 'Quota exceeded'))
    return {
      output: stream.value,
      error: quotaCheck.error,
      quota: quotaCheck.quota,
    }
  }

  // STEP 3: Generate explanation with AI
  console.log(`[AI] Cache MISS for question ${question.id}, generating...`)

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

    try {
      const result = streamText({
        model: geminiModel,
        system,
        prompt,
        temperature: 0.7,
      })

      let fullText = ""

      // Stream the text
      for await (const delta of result.textStream) {
        fullText += delta
        stream.update(fullText)
      }

      // Wait for usage metadata
      const usage = await result.usage

      // Calculate cost
      const cost = calculateAICost({
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      })

      console.log(`[AI] Generated explanation:`, {
        questionId: question.id,
        tokens: usage.totalTokens,
        costBRL: cost.totalCostBRL.toFixed(6),
      })

      // STEP 4: Save explanation to database (global cache)
      try {
        await supabase
          .from('Question')
          .update({ aiExplanation: fullText })
          .eq('id', question.id)

        console.log(`[AI] Cached explanation for question ${question.id}`)
      } catch (cacheError) {
        console.error('[AI] Failed to cache explanation:', cacheError)
        // Don't fail the request if caching fails
      }

      // STEP 5: Record usage and increment quota
      await recordAIUsage({
        userId,
        type: 'QUESTION_EXPLANATION',
        resourceId: question.id,
        promptTokens: cost.inputTokens,
        completionTokens: cost.outputTokens,
        totalTokens: cost.totalTokens,
        estimatedCostBRL: cost.totalCostBRL,
        cacheHit: false,
        status: 'SUCCESS',
      })

      stream.done()
    } catch (error) {
      console.error('[AI] Error generating explanation:', error)

      // Log error
      await recordAIUsage({
        userId,
        type: 'QUESTION_EXPLANATION',
        resourceId: question.id,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostBRL: 0,
        cacheHit: false,
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })

      stream.error(error instanceof Error ? error : new Error('Unknown error'))
    }
  })()

  return {
    output: stream.value,
    cached: false,
  }
}

// Essay correction schemas (unchanged)
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

interface CorrectEssayParams {
  essayId: string
  essayText: string
  theme: string
  userId: string
  userPlan: string
}

/**
 * Correct essay with quota check
 */
export async function correctEssay(params: CorrectEssayParams) {
  const { essayId, essayText, theme, userId, userPlan } = params

  // STEP 1: Check quota
  const quotaCheck = await canCorrectEssay(userId, userPlan)

  if (!quotaCheck.allowed) {
    return {
      success: false,
      error: quotaCheck.error || 'Quota exceeded',
      quota: quotaCheck.quota,
    }
  }

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

    const result = await generateObject({
      model: geminiModel,
      system,
      prompt,
      schema: essayFeedbackSchema,
      temperature: 0.5,
    })

    // Get usage metadata
    const usage = result.usage

    // Calculate cost
    const cost = calculateAICost({
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
    })

    console.log(`[AI] Corrected essay:`, {
      essayId,
      tokens: usage.totalTokens,
      costBRL: cost.totalCostBRL.toFixed(6),
    })

    // STEP 2: Record usage and increment quota
    await recordAIUsage({
      userId,
      type: 'ESSAY_CORRECTION',
      resourceId: essayId,
      promptTokens: cost.inputTokens,
      completionTokens: cost.outputTokens,
      totalTokens: cost.totalTokens,
      estimatedCostBRL: cost.totalCostBRL,
      cacheHit: false,
      status: 'SUCCESS',
    })

    return { success: true, data: result.object }
  } catch (error) {
    console.error("[AI] Error correcting essay:", error)

    // Log error (don't increment quota on error)
    await recordAIUsage({
      userId,
      type: 'ESSAY_CORRECTION',
      resourceId: essayId,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostBRL: 0,
      cacheHit: false,
      status: 'ERROR',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return { success: false, error: "Erro ao corrigir redação" }
  }
}
