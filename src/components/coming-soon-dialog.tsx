"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

interface ComingSoonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: "ai-explanation" | "essay-correction"
}

const featureDetails = {
  "ai-explanation": {
    title: "Explicações por IA",
    description: "Explicações detalhadas de questões usando inteligência artificial",
    icon: "✨",
  },
  "essay-correction": {
    title: "Correção de Redação",
    description: "Correção de redações por IA com avaliação das 5 competências do ENEM",
    icon: "📝",
  },
}

export function ComingSoonDialog({ open, onOpenChange, feature }: ComingSoonDialogProps) {
  const currentFeature = featureDetails[feature]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-6 text-primary" />
            <DialogTitle className="text-2xl">Em Breve</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {currentFeature.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-primary/10 p-6 border border-primary/20 text-center">
            <span className="text-4xl mb-3 block">{currentFeature.icon}</span>
            <h4 className="font-semibold text-lg mb-2">{currentFeature.title}</h4>
            <p className="text-muted-foreground">
              Estamos trabalhando para trazer este recurso em breve.
              Continue explorando todas as questões do ENEM disponíveis!
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h4 className="font-semibold mb-2">Enquanto isso, você pode:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Estudar todas as questões do ENEM 2025</li>
              <li>• Criar grupos personalizados de questões</li>
              <li>• Exportar questões para PDF</li>
              <li>• Fazer simulados personalizados</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={() => onOpenChange(false)}
          className="w-full"
        >
          Entendi
        </Button>
      </DialogContent>
    </Dialog>
  )
}
