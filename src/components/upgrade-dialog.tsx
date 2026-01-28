"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, Clock } from "lucide-react"
import Link from "next/link"

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: "ai-explanation" | "essay-correction"
}

export function UpgradeDialog({ open, onOpenChange, feature = "ai-explanation" }: UpgradeDialogProps) {
  const featureDetails = {
    "ai-explanation": {
      title: "Explicações por IA",
      description: "Desbloqueie explicações detalhadas de questões usando inteligência artificial",
      icon: "✨",
    },
    "essay-correction": {
      title: "Correção de Redação",
      description: "Tenha suas redações corrigidas por IA com avaliação das 5 competências do ENEM",
      icon: "📝",
    },
  }

  const currentFeature = featureDetails[feature]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-6 text-primary" />
            <DialogTitle className="text-2xl">Recurso PRO</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {currentFeature.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Feature highlight */}
          <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{currentFeature.icon}</span>
              <div className="space-y-1">
                <h4 className="font-semibold">{currentFeature.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Disponível apenas no plano <span className="font-semibold text-primary">Rumo à Aprovação</span>
                </p>
              </div>
            </div>
          </div>

          {/* Benefits list */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">O que você ganha com o PRO:</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <span className="text-sm">Questões e grupos de estudo ilimitados</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <span className="text-sm">Explicações detalhadas por IA</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <span className="text-sm">Correção de redação com feedback das 5 competências</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <span className="text-sm">Exportação PDF profissional</span>
              </div>
            </div>
          </div>

          {/* Coming soon notice */}
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">
              O plano Rumo à Aprovação estará disponível em breve
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button className="w-full" variant="outline" disabled size="lg">
            <Clock className="mr-2 size-4" />
            Em breve
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
