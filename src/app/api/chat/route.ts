import { streamText } from "ai"
import { geminiModel } from "@/lib/ai"

export const maxDuration = 30

export async function POST(req: Request) {
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
