"use client"

import { useState } from "react"
import { Download, Loader2, ChevronDown, FileText, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { QuestionWithExam } from "@/types"
import { toast } from "sonner"

type PDFExportButtonProps = {
  questions: QuestionWithExam[]
  filename: string
  title?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  children?: React.ReactNode
}

export function PDFExportButton({
  questions,
  filename,
  title = "Questões do ENEM",
  variant = "outline",
  size = "sm",
  children,
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (showAnswers: boolean) => {
    if (questions.length === 0) {
      toast.error("Nenhuma questão para exportar")
      return
    }

    setIsExporting(true)

    try {
      // Dynamic imports para reduzir bundle inicial
      const { pdf } = await import("@react-pdf/renderer")
      const { QuestionsPDFDocument } = await import("./pdf-document")

      console.log("[PDF] Gerando documento...", {
        questionsCount: questions.length,
        showAnswers,
      })

      // Gerar PDF
      const blob = await pdf(
        <QuestionsPDFDocument
          questions={questions}
          title={title}
          showAnswers={showAnswers}
        />
      ).toBlob()

      console.log("[PDF] Blob gerado:", { size: blob.size })

      // Nome do arquivo com sufixo se sem gabarito
      const finalFilename = showAnswers ? filename : `${filename}-sem-gabarito`

      // Trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${finalFilename}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`PDF exportado! (${questions.length} questões)`)
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      toast.error(
        `Erro ao exportar PDF: ${error instanceof Error ? error.message : "Tente novamente"}`
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isExporting || questions.length === 0}
          variant={variant}
          size={size}
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {children || (isExporting ? "Gerando..." : "Exportar PDF")}
          <ChevronDown className="size-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport(true)}>
          <FileCheck className="size-4 mr-2" />
          Com gabarito
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(false)}>
          <FileText className="size-4 mr-2" />
          Sem gabarito
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
