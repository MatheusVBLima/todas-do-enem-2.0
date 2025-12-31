"use client"

import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createEssay, updateEssay, submitEssay } from "@/server/actions/essays"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"

interface EssayEditorProps {
  userId: string
  essayId?: string
  initialTitle?: string
  initialTheme?: string
  initialContent?: string
  onSaved?: (essayId: string) => void
  onClose?: () => void
}

export function EssayEditor({
  userId,
  essayId,
  initialTitle = "",
  initialTheme = "",
  initialContent = "",
  onSaved,
  onClose,
}: EssayEditorProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(initialTitle)
  const [theme, setTheme] = useState(initialTheme)
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentEssayId, setCurrentEssayId] = useState(essayId)

  // Calculate word count
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const minWords = 200
  const isValidForSubmission = wordCount >= minWords && title.trim() && theme.trim()

  const handleSubmit = async () => {
    if (!isValidForSubmission) {
      if (wordCount < minWords) {
        toast.error(`A redação deve ter no mínimo ${minWords} palavras`)
      } else {
        toast.error("Preencha todos os campos antes de enviar")
      }
      return
    }

    setIsSubmitting(true)

    try {
      let essayIdToSubmit = currentEssayId

      // If no essayId, create draft first
      if (!essayIdToSubmit) {
        const createResult = await createEssay({
          userId,
          title,
          theme,
          content,
        })

        if (!createResult.success || !createResult.data) {
          toast.error("Erro ao salvar redação")
          setIsSubmitting(false)
          return
        }

        essayIdToSubmit = createResult.data.id
        setCurrentEssayId(essayIdToSubmit)
        onSaved?.(essayIdToSubmit)
      } else {
        // Update existing essay before submitting
        const updateResult = await updateEssay(essayIdToSubmit, {
          title,
          theme,
          content,
        })

        if (!updateResult.success) {
          toast.error("Erro ao atualizar redação")
          setIsSubmitting(false)
          return
        }
      }

      // Now submit the essay for correction
      const result = await submitEssay(essayIdToSubmit)

      if (result.success) {
        toast.success("Redação enviada para correção!")

        // Invalidate queries to refresh the list automatically
        queryClient.invalidateQueries({ queryKey: queryKeys.essays.list(userId) })

        // Call onSaved callback if provided (used in edit dialog)
        if (onSaved) {
          onSaved(essayIdToSubmit)
        }

        // Always close the dialog after successful submission
        onClose?.()
      } else {
        toast.error(result.error || "Erro ao enviar redação")
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Erro ao enviar redação para correção")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {currentEssayId ? "Editar Redação" : "Nova Redação"}
        </h2>

        <Button
          onClick={handleSubmit}
          disabled={!isValidForSubmission || isSubmitting}
          size="lg"
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Enviar para Correção
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título da Redação</Label>
          <Input
            id="title"
            placeholder="Ex: Redação ENEM 2024 - Desafios da educação"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">Tema/Proposta</Label>
          <Input
            id="theme"
            placeholder="Ex: Os desafios da educação digital no Brasil"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Texto da Redação</Label>
            <span className={`text-sm ${wordCount >= minWords ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
              {wordCount} {wordCount === 1 ? "palavra" : "palavras"}
              {wordCount < minWords && ` (mínimo: ${minWords})`}
            </span>
          </div>
          <Textarea
            id="content"
            placeholder="Escreva sua redação aqui..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] font-serif text-base leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">
            Dica: Escreva no formato dissertativo-argumentativo do ENEM. Lembre-se de introdução, desenvolvimento e conclusão com proposta de intervenção.
          </p>
        </div>
      </div>
    </div>
  )
}
