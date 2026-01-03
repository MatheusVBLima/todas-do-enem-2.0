"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Download, Calendar } from "lucide-react"
import type { Proof } from "@/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ProofCardProps {
  proof: Proof
}

export function ProofCard({ proof }: ProofCardProps) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!proof.pdfUrl) return
    try {
      const response = await fetch(proof.pdfUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ENEM_${proof.year}_${proof.season || 'prova'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading PDF:", error)
    }
  }

  return (
    <Link href={`/provas/${proof.id}`} className="group block">
      <Card className="overflow-hidden transition-all hover:border-primary/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <FileText className="size-5" />
                </div>
                <h3 className="font-bold text-lg tracking-tight">ENEM {proof.year}</h3>
              </div>
              {proof.testDate && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 ml-1">
                  <Calendar className="size-3.5 opacity-70" />
                  {format(new Date(proof.testDate), "dd 'de' MMMM", {
                    locale: ptBR,
                  })}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              {proof.season && (
                <Badge
                  variant="secondary"
                  className="font-semibold"
                  
                >
                  {proof.season}
                </Badge> 
              )}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="size-1.5 rounded-full bg-green-500" />
                <span>PDF Original</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-1.5 rounded-full bg-blue-500" />
                <span>Gabarito</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 font-medium"
            >
              <Eye className="size-4 mr-2 opacity-70" />
              Visualizar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="flex-1 font-medium"
            >
              <Download className="size-4 mr-2 opacity-70" />
              Baixar
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
