"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  title,
  variant = "outline",
  size = "sm",
  children,
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (questions.length === 0) {
      toast.error("Nenhuma questão para exportar")
      return
    }

    setIsExporting(true)

    try {
      // Dynamic import to reduce initial bundle size - PDF library only loads on click
      const { generateQuestionsPDF, downloadPDF } = await import("@/lib/pdf-generator")
      const blob = await generateQuestionsPDF(questions, title)
      downloadPDF(blob, `${filename}.pdf`)
      toast.success(`PDF exportado com sucesso! (${questions.length} questões)`)
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      toast.error("Erro ao exportar PDF. Tente novamente.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting || questions.length === 0}
      variant={variant}
      size={size}
    >
      {isExporting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {children || (isExporting ? "Exportando..." : "Exportar PDF")}
    </Button>
  )
}
