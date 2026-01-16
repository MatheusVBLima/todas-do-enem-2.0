"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PdfDownloadButton } from "@/components/proofs/pdf-download-button"
import { ArrowLeft, Calendar, Loader2 } from "lucide-react"
import { getProof } from "@/server/actions/proofs"
import { queryKeys } from "@/lib/query-keys"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Dynamic import for PDF Viewer - heavy component with react-pdf
const PdfViewer = dynamic(
  () => import("@/components/proofs/pdf-viewer").then(mod => mod.PdfViewer),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[700px] bg-[#1a1a1a] rounded-xl border border-border/50">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-white/60 font-medium mt-4">Carregando visualizador de PDF...</p>
      </div>
    ),
    ssr: false,
  }
)

interface ProofViewerContentProps {
  proofId: string
}

export function ProofViewerContent({ proofId }: ProofViewerContentProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.proofs.detail(proofId),
    queryFn: () => getProof(proofId),
  })

  if (!data.success || !data.data) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar prova</p>
        <Button asChild className="mt-4">
          <Link href="/provas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para provas
          </Link>
        </Button>
      </div>
    )
  }

  const proof = data.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              ENEM {proof.year}
            </h1>
            {proof.season && (
              <Badge
                className="text-base"
                style={{
                  backgroundColor: proof.color || "#3B82F6",
                  color: "white",
                }}
              >
                {proof.season}
              </Badge>
            )}
          </div>
          {proof.testDate && (
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(proof.testDate), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          )}
          {proof.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {proof.description}
            </p>
          )}
        </div>
        {proof.pdfUrl && (
          <PdfDownloadButton
            pdfUrl={proof.pdfUrl}
            year={proof.year}
            season={proof.season ?? undefined}
            size="default"
          />
        )}
      </div>

      {/* PDF Viewer */}
      {proof.pdfUrl && (
        <PdfViewer
          pdfUrl={proof.pdfUrl}
          fileName={`ENEM_${proof.year}_${proof.season || 'prova'}.pdf`}
        />
      )}
    </div>
  )
}
