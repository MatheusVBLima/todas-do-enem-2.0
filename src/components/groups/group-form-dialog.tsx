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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type GroupFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    id: string
    name: string
    description: string | null
    color: string
  }
  onSubmit: (data: { name: string; description?: string; color: string }) => Promise<void>
  title: string
  description: string
}

const GROUP_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
]

export function GroupFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  title,
  description,
}: GroupFormDialogProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [desc, setDesc] = useState(initialData?.description || "")
  const [color, setColor] = useState(initialData?.color || GROUP_COLORS[0])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Por favor, insira um nome para o grupo")
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: desc.trim() || undefined,
        color,
      })
      onOpenChange(false)
      setName("")
      setDesc("")
      setColor(GROUP_COLORS[0])
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do grupo *</Label>
              <Input
                id="name"
                placeholder="Ex: Questões de Matemática"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva o propósito deste grupo..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {GROUP_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "size-8 rounded-full transition-all hover:scale-110",
                      color === c && "ring-2 ring-offset-2 ring-primary scale-110"
                    )}
                    style={{
                      backgroundColor: c,
                    }}
                    disabled={isLoading}
                  >
                    <span className="sr-only">Selecionar cor {c}</span>
                  </button>
                ))}
              </div>
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
              {initialData ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
