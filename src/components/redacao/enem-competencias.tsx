"use client"

import { Award, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const COMPETENCIAS = [
  {
    numero: 1,
    titulo: "Domínio da modalidade escrita formal da língua portuguesa",
    descricao: "Demonstrar domínio da modalidade escrita formal da língua portuguesa.",
    criterios: [
      "Ortografia correta",
      "Uso adequado da acentuação",
      "Pontuação apropriada",
      "Concordância verbal e nominal",
      "Regência verbal e nominal",
      "Emprego correto de pronomes",
      "Ausência de marcas de oralidade"
    ],
    pontuacaoMaxima: 200,
    color: "bg-blue-500"
  },
  {
    numero: 2,
    titulo: "Compreensão da proposta de redação",
    descricao: "Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento para desenvolver o tema, dentro dos limites estruturais do texto dissertativo-argumentativo em prosa.",
    criterios: [
      "Abordar o tema proposto de forma completa",
      "Desenvolver argumentação pertinente ao tema",
      "Utilizar repertório sociocultural produtivo",
      "Demonstrar conhecimento de mundo",
      "Manter-se dentro do tipo textual dissertativo-argumentativo",
      "Desenvolver o tema de forma coerente"
    ],
    pontuacaoMaxima: 200,
    color: "bg-green-500"
  },
  {
    numero: 3,
    titulo: "Seleção e organização das informações",
    descricao: "Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista.",
    criterios: [
      "Apresentar informações relevantes",
      "Organizar ideias de forma lógica",
      "Defender um ponto de vista claro",
      "Utilizar argumentos consistentes",
      "Relacionar informações de forma coerente",
      "Evitar contradições",
      "Apresentar progressão temática"
    ],
    pontuacaoMaxima: 200,
    color: "bg-purple-500"
  },
  {
    numero: 4,
    titulo: "Coesão textual",
    descricao: "Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.",
    criterios: [
      "Usar conectivos adequados",
      "Estabelecer relações entre parágrafos",
      "Manter continuidade temática",
      "Evitar repetições desnecessárias",
      "Usar sinônimos e pronomes adequadamente",
      "Garantir progressão textual",
      "Articular bem as partes do texto"
    ],
    pontuacaoMaxima: 200,
    color: "bg-orange-500"
  },
  {
    numero: 5,
    titulo: "Proposta de intervenção",
    descricao: "Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.",
    criterios: [
      "Apresentar proposta relacionada ao tema",
      "Detalhar a ação (o que fazer)",
      "Indicar o agente (quem vai fazer)",
      "Especificar o modo/meio (como fazer)",
      "Apontar a finalidade (para quê)",
      "Detalhar possíveis efeitos",
      "Respeitar os direitos humanos"
    ],
    pontuacaoMaxima: 200,
    color: "bg-red-500"
  }
]

export function EnemCompetencias() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Competências do ENEM</h2>
        <p className="text-muted-foreground">
          Entenda os critérios de avaliação da redação do ENEM. Cada competência vale até 200 pontos,
          totalizando 1000 pontos.
        </p>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5 text-primary" />
            Nota Máxima: 1000 pontos
          </CardTitle>
          <CardDescription>
            A nota final é a soma das 5 competências (200 pontos cada)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-5">
            {COMPETENCIAS.map((comp) => (
              <div key={comp.numero} className="text-center">
                <div className={`mx-auto mb-1 size-8 rounded-full ${comp.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {comp.numero}
                </div>
                <p className="text-xs text-muted-foreground">200pts</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competências detalhadas */}
      <div className="space-y-4">
        {COMPETENCIAS.map((competencia, index) => (
          <Card key={competencia.numero}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className={`shrink-0 size-10 rounded-full ${competencia.color} flex items-center justify-center text-white font-bold`}>
                  {competencia.numero}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">
                    Competência {competencia.numero}
                  </CardTitle>
                  <CardDescription className="font-medium text-foreground">
                    {competencia.titulo}
                  </CardDescription>
                  <Badge variant="outline" className="mt-2">
                    Até {competencia.pontuacaoMaxima} pontos
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {competencia.descricao}
              </p>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 text-sm">
                  O que é avaliado:
                </h4>
                <ul className="space-y-2">
                  {competencia.criterios.map((criterio, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <span>{criterio}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dicas */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Estrutura mínima:</strong> Introdução, desenvolvimento (2-3 parágrafos) e conclusão com proposta de intervenção.
          </p>
          <p>
            <strong>Limite de linhas:</strong> Mínimo de 7 linhas e máximo de 30 linhas.
          </p>
          <p>
            <strong>Tipo textual:</strong> Apenas dissertativo-argumentativo em prosa.
          </p>
          <p>
            <strong>Direitos humanos:</strong> Respeitar os direitos humanos é essencial, especialmente na proposta de intervenção.
          </p>
          <p>
            <strong>Tema:</strong> Abordar o tema de forma completa, sem tangenciá-lo ou fugir dele.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
