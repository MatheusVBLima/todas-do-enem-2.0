import { streamText } from "ai"
import { geminiModel } from "@/lib/ai"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { canAccessAIExplanations } from "@/lib/auth/permissions"
import { NextResponse } from "next/server"
import { canGenerateExplanation, recordAIUsage } from "@/lib/ai-quota"
import { calculateAICost } from "@/lib/ai-cost-calculator"
import { supabase } from "@/lib/supabase/server"
import type { Question } from "@/types"

export const maxDuration = 30

export async function POST(req: Request) {
  // Check if user is authenticated
  const authUser = await getCurrentUser()

  if (!authUser) {
    return NextResponse.json(
      { error: 'Você precisa estar logado para usar este recurso' },
      { status: 401 }
    )
  }

  // Get user from database
  const userResult = await getUserProfile(authUser.id)

  if (!userResult.success || !userResult.data) {
    return NextResponse.json(
      { error: 'Erro ao verificar permissões do usuário' },
      { status: 403 }
    )
  }

  const user = userResult.data

  // COMING SOON MODE: Disable AI features
  const FEATURES_ENABLED = true // Change to true when ready to launch

  if (!FEATURES_ENABLED) {
    return NextResponse.json(
      { error: 'Este recurso estará disponível em breve.' },
      { status: 503 }
    )
  }

  // Check if user has access to AI explanations (paid feature)
  if (!canAccessAIExplanations(user.plan)) {
    return NextResponse.json(
      { error: 'Este recurso é exclusivo do plano Rumo à Aprovação. Faça upgrade para ter acesso às explicações por IA.' },
      { status: 403 }
    )
  }

  const { messages, questionId } = await req.json()

  // Check if we have a cached explanation (global cache)
  let cachedExplanation: string | null = null

  if (questionId) {
    console.log('[Chat API] Checking cache for question:', questionId)
    const { data: questionData } = await supabase
      .from('Question')
      .select('aiExplanation')
      .eq('id', questionId)
      .single<Pick<Question, 'aiExplanation'>>()

    if (questionData?.aiExplanation) {
      console.log('[Chat API] Cache HIT for question:', questionId)
      cachedExplanation = questionData.aiExplanation

      // Record cache hit
      await recordAIUsage({
        userId: user.id,
        type: 'QUESTION_EXPLANATION',
        resourceId: questionId,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostBRL: 0,
        cacheHit: true,
        status: 'SUCCESS',
      })
    } else {
      console.log('[Chat API] Cache MISS for question:', questionId)
    }
  }

  // Check quota before generating (only if not cached)
  if (!cachedExplanation) {
    const quotaCheck = await canGenerateExplanation(user.id, user.plan)

    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: quotaCheck.error || 'Quota exceeded' },
        { status: 403 }
      )
    }
  }

  // If cached, use streamText with cached content for native streaming
  if (cachedExplanation) {
    console.log('[Chat API] Streaming cached explanation')

    const result = streamText({
      model: geminiModel,
      prompt: `Retorne EXATAMENTE este texto, palavra por palavra, sem alterações:\n\n${cachedExplanation}`,
      temperature: 0,
    })

    return result.toUIMessageStreamResponse()
  }

  // Converter formato do useChat v6 (com parts) para formato do streamText (com content)
  const convertedMessages = messages.map((msg: any) => ({
    role: msg.role,
    content: msg.parts
      ? msg.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("")
      : msg.content,
  }))

  const result = streamText({
    model: geminiModel,
    messages: convertedMessages,
    system: `Você é um especialista em questões do ENEM. Sua tarefa é explicar questões de forma clara e didática.

Forneça uma explicação estruturada em **markdown** com:

## 📚 Análise da Questão
Contextualize brevemente o tema e o que está sendo cobrado.

## ✅ Por que a alternativa correta está certa?
Explique o raciocínio passo a passo que leva à resposta correta.

## ⚠️ Erros Comuns
Mencione armadilhas ou confusões frequentes que estudantes cometem.

Use **negrito** para destacar conceitos-chave, *itálico* para ênfase, e listas quando apropriado. Seja conciso mas completo. Use português do Brasil.`,
    temperature: 0.7,
    async onFinish({ usage, text }) {
      // Record AI usage after streaming completes
      try {
        const cost = calculateAICost({
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
        })

        console.log('[Chat API] Recording usage:', {
          userId: user.id,
          tokens: usage.totalTokens,
          costBRL: cost.totalCostBRL.toFixed(6),
        })

        await recordAIUsage({
          userId: user.id,
          type: 'QUESTION_EXPLANATION',
          resourceId: questionId || 'chat',
          promptTokens: cost.inputTokens,
          completionTokens: cost.outputTokens,
          totalTokens: cost.totalTokens,
          estimatedCostBRL: cost.totalCostBRL,
          cacheHit: false,
          status: 'SUCCESS',
        })

        // Save to database for global cache
        if (questionId && text) {
          console.log('[Chat API] Saving explanation to cache for question:', questionId)
          await supabase
            .from('Question')
            .update({ aiExplanation: text })
            .eq('id', questionId)
        }
      } catch (error) {
        console.error('[Chat API] Failed to record usage:', error)
        // Don't fail the request if logging fails
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
