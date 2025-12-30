import { Suspense } from "react"
import Link from "next/link"
import { CheckCircle, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SucessoPage() {
  return (
    <div className="container mx-auto max-w-2xl py-16">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl">Assinatura Confirmada!</CardTitle>
          <CardDescription className="text-lg">
            Bem-vindo ao plano Rumo à Aprovação
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-semibold">Explicações por IA</p>
                <p className="text-sm text-muted-foreground">
                  Acesse explicações detalhadas de cada questão
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-semibold">Correção de Redação</p>
                <p className="text-sm text-muted-foreground">
                  Receba feedback detalhado das 5 competências do ENEM
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-semibold">Exportação Profissional</p>
                <p className="text-sm text-muted-foreground">
                  Gere PDFs personalizados dos seus estudos
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">
                Começar a Estudar
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/redacao">
                Escrever Redação
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Você pode gerenciar sua assinatura a qualquer momento em{" "}
            <Link href="/conta" className="text-primary hover:underline">
              Minha Conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
