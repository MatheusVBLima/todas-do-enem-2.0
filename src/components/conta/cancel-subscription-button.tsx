"use client"

import { useState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
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
import { cancelSubscription } from "@/server/actions/stripe"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CancelSubscriptionButtonProps {
  periodEnd: string | null
}

export function CancelSubscriptionButton({ periodEnd }: CancelSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setIsLoading(true)

    try {
      const result = await cancelSubscription()

      if (!result.success) {
        toast.error(result.error || 'Erro ao cancelar assinatura')
        return
      }

      toast.success('Assinatura cancelada com sucesso')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Cancel subscription error:', error)
      toast.error('Erro ao cancelar assinatura')
    } finally {
      setIsLoading(false)
    }
  }

  const formattedPeriodEnd = periodEnd
    ? new Date(periodEnd).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Cancelar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="size-5 text-destructive" />
            Cancelar Assinatura
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <p>Tem certeza que deseja cancelar sua assinatura do plano PRO?</p>

            {formattedPeriodEnd && (
              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium text-foreground mb-1">
                  📅 Você manterá o acesso até {formattedPeriodEnd}
                </p>
                <p className="text-sm">
                  Sua assinatura será cancelada no final do período de cobrança atual.
                  Você continuará tendo acesso a todos os recursos PRO até lá.
                </p>
              </div>
            )}

            <p className="text-sm">
              Após o cancelamento, você:
            </p>
            <ul className="text-sm list-disc list-inside space-y-1 ml-2">
              <li>Perderá acesso às explicações por IA</li>
              <li>Não poderá mais corrigir redações</li>
              <li>Voltará ao plano gratuito</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Manter Assinatura
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleCancel()
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              'Sim, Cancelar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
