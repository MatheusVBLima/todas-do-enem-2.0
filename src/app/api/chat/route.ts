import { streamText } from "ai"
import { geminiModel } from "@/lib/ai"
import { getCurrentUser } from "@/lib/auth/server"
import { getUserProfile } from "@/server/actions/users"
import { canAccessAIExplanations } from "@/lib/auth/permissions"
import { NextResponse } from "next/server"

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

  // Check if user has access to AI explanations (paid feature)
  if (!canAccessAIExplanations(userResult.data.plan)) {
    return NextResponse.json(
      { error: 'Este recurso é exclusivo do plano Rumo à Aprovação. Faça upgrade para ter acesso às explicações por IA.' },
      { status: 403 }
    )
  }

  const { messages } = await req.json()

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
  })

  return result.toUIMessageStreamResponse()
}
