"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/server/actions/stripe"
import { toast } from "sonner"

interface SubscribeButtonProps {
  userId?: string | null
}

export function SubscribeButton({ userId }: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    if (!userId) {
      toast.error('Você precisa estar logado para assinar')
      router.push('/login')
      return
    }

    setIsLoading(true)

    try {
      const result = await createCheckoutSession()

      if (!result.success) {
        toast.error(result.error || 'Erro ao criar sessão de pagamento')
        return
      }

      if (result.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.url
      }
    } catch (error) {
      console.error('Subscribe error:', error)
      toast.error('Erro ao iniciar assinatura')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className="w-full"
      onClick={handleSubscribe}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Carregando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 size-4" />
          Assinar PRO
        </>
      )}
    </Button>
  )
}
