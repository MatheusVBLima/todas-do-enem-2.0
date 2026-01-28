"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createQuestionReport } from "@/server/actions/reports"

interface ReportQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionId: string
}

export function ReportQuestionDialog({
  open,
  onOpenChange,
  questionId,
}: ReportQuestionDialogProps) {
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      const result = await createQuestionReport({
        questionId,
        description: description.trim() || undefined,
      })

      if (result.success) {
        toast.success("Problema reportado com sucesso!")
        onOpenChange(false)
        setDescription("")
      } else {
        toast.error(result.error || "Erro ao reportar problema")
      }
    } catch (error) {
      console.error("Error reporting question:", error)
      toast.error("Erro inesperado ao reportar problema")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Reportar Problema na Questão</DialogTitle>
            <DialogDescription>
              Encontrou um erro nesta questão? Descreva o problema para que possamos corrigi-lo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição do problema (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Ex: O gabarito está incorreto, a imagem não carrega, o texto está cortado..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
