"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { reactivateSubscription } from "@/server/actions/stripe"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ReactivateSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleReactivate = async () => {
    setIsLoading(true)

    try {
      const result = await reactivateSubscription()

      if (!result.success) {
        toast.error(result.error || 'Erro ao reativar assinatura')
        return
      }

      toast.success('Assinatura reativada com sucesso!')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Reactivate subscription error:', error)
      toast.error('Erro ao reativar assinatura')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="default" size="sm">
          Reativar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            Reativar Assinatura
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <p>Deseja reativar sua assinatura do plano PRO?</p>

            <div className="rounded-lg bg-muted p-4">
              <p className="font-medium text-foreground mb-1">
                ✅ Sua assinatura continuará ativa
              </p>
              <p className="text-sm">
                Ao reativar, o cancelamento agendado será removido e sua assinatura
                continuará renovando automaticamente todos os meses.
              </p>
            </div>

            <p className="text-sm">
              Você poderá cancelar novamente a qualquer momento.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleReactivate()
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Reativando...
              </>
            ) : (
              'Sim, Reativar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
