import Link from "next/link"
import {
  GraduationCap,
  BookOpen,
  FolderOpen,
  Brain,
  FileText,
  Download,
  Zap,
  Check,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_PLANS } from "@/lib/constants"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { BackgroundBeams } from "@/components/ui/background-beams"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-6 text-primary" />
            <span className="font-bold text-lg">Todas do ENEM</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/questoes">
              <Button variant="ghost">Questões</Button>
            </Link>
            <Link href="/questoes">
              <Button>Começar Agora</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <AuroraBackground>
        <div className="relative z-10 flex flex-col items-center gap-8 px-4 py-20 text-center md:py-32">
          <Badge variant="secondary" className="px-4 py-1">
            +10.000 questões do ENEM desde 1998
          </Badge>

          <TextGenerateEffect
            words="Estude todas as questões do ENEM em um só lugar"
            className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl"
          />

          <p className="max-w-xl text-lg text-muted-foreground">
            Acesse questões de 1998 até hoje, filtre por área e disciplina,
            crie grupos de estudo e exporte para PDF.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/questoes">
              <Button size="lg" className="gap-2">
                Começar a Estudar
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="#planos">
              <Button size="lg" variant="outline">
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>
      </AuroraBackground>

      {/* Features */}
      <section className="relative container mx-auto px-4 py-20 overflow-hidden">
        <BackgroundBeams />
        <div className="relative z-10">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Tudo que você precisa para estudar
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <BookOpen className="size-10 text-primary mb-2" />
              <CardTitle>Banco de Questões Completo</CardTitle>
              <CardDescription>
                Todas as questões do ENEM desde 1998, organizadas por área e disciplina.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FolderOpen className="size-10 text-primary mb-2" />
              <CardTitle>Grupos de Estudo</CardTitle>
              <CardDescription>
                Organize questões em grupos personalizados para estudar de forma mais eficiente.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="size-10 text-primary mb-2" />
              <CardTitle>Exportação PDF</CardTitle>
              <CardDescription>
                Exporte suas questões e grupos para PDF e estude offline.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="size-10 text-primary mb-2" />
              <CardTitle>Explicação por IA</CardTitle>
              <CardDescription>
                Receba explicações detalhadas de cada questão geradas por inteligência artificial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Plano PRO</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="size-10 text-primary mb-2" />
              <CardTitle>Correção de Redação</CardTitle>
              <CardDescription>
                Escreva suas redações e receba correção automática com feedback por competência.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Plano PRO</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="size-10 text-primary mb-2" />
              <CardTitle>Filtros Avançados</CardTitle>
              <CardDescription>
                Filtre questões por ano, área, disciplina e palavras-chave para encontrar exatamente o que precisa.
              </CardDescription>
            </CardHeader>
          </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Escolha seu plano
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            Comece grátis e faça upgrade quando quiser
          </p>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>{SUBSCRIPTION_PLANS.TENTANDO_A_SORTE.name}</CardTitle>
                <CardDescription>Para quem está começando</CardDescription>
                <div className="flex items-baseline gap-1 pt-4">
                  <span className="text-4xl font-bold">Grátis</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {SUBSCRIPTION_PLANS.TENTANDO_A_SORTE.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/questoes" className="block">
                  <Button variant="outline" className="w-full">
                    Começar Grátis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{SUBSCRIPTION_PLANS.RUMO_A_APROVACAO.name}</CardTitle>
                  <Badge>Popular</Badge>
                </div>
                <CardDescription>Para quem quer ir além</CardDescription>
                <div className="flex items-baseline gap-1 pt-4">
                  <span className="text-4xl font-bold">R$25</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {SUBSCRIPTION_PLANS.RUMO_A_APROVACAO.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full">
                  Assinar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            <span className="font-semibold">Todas do ENEM</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Feito com carinho para estudantes brasileiros
          </p>
        </div>
      </footer>
    </div>
  )
}
