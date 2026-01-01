"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface PdfDownloadButtonProps {
  pdfUrl: string
  year: number
  season?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function PdfDownloadButton({
  pdfUrl,
  year,
  season,
  variant = "secondary",
  size = "sm",
}: PdfDownloadButtonProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ENEM_${year}${season ? `_${season}` : ""}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading PDF:", error)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      variant={variant}
      size={size}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      <span>Baixar</span>
    </Button>
  )
}
