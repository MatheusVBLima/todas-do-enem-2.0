"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  Download,
  RotateCw,
  Search,
  Scaling,
  MoreVertical,
  Loader2
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Configure PDF.js worker - use CDN for better CORS handling
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  pdfUrl: string
  fileName?: string
}

export function PdfViewer({ pdfUrl, fileName }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [containerWidth, setContainerWidth] = useState<number>(800)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName || "prova.pdf"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading PDF:", error)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error)
    setError(error.message)
  }

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(1, prev - 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(numPages, prev + 1))
  }, [numPages])

  const zoomIn = () => {
    setScale((prev) => Math.min(3.0, prev + 0.1))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.1))
  }

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Handle container resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      window.removeEventListener("resize", updateWidth)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevPage()
      if (e.key === "ArrowRight") goToNextPage()
      if (e.key === "+" || (e.ctrlKey && e.key === "=")) {
        e.preventDefault()
        zoomIn()
      }
      if (e.key === "-" || (e.ctrlKey && e.key === "-")) {
        e.preventDefault()
        zoomOut()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [goToPrevPage, goToNextPage])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative flex flex-col bg-[#1a1a1a] rounded-xl overflow-hidden border border-border/50 transition-all",
        isFullscreen ? "h-screen w-screen rounded-none" : "min-h-[700px] h-[800px] w-full shadow-2xl"
      )}
    >
      {/* Professional Floating Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl transition-all hover:bg-black/90">
        <div className="flex items-center gap-1 px-2 border-r border-white/10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/10"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1.5 px-2 text-[13px] font-medium text-white min-w-[90px] justify-center">
            <span>{pageNumber}</span>
            <span className="opacity-40">/</span>
            <span className="opacity-60">{numPages || "--"}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/10"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-white/10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/10"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            aria-label="Diminuir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 px-2 min-w-[50px] justify-center">
            <span className="text-[13px] font-medium text-white">{Math.round(scale * 100)}%</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/10"
            onClick={zoomIn}
            disabled={scale >= 3.0}
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 px-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/10 hidden sm:flex"
            onClick={rotate}
            aria-label="Rotacionar"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white hover:bg-white/10"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/10" aria-label="Mais opções">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-black/90 backdrop-blur-xl border-white/10 text-white"
              container={isFullscreen ? containerRef.current : undefined}
            >
              <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => setScale(1.0)}>
                <Scaling className="h-4 w-4 mr-2" />
                Zoom original
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => setRotation(0)}>
                <RotateCw className="h-4 w-4 mr-2" />
                Resetar rotação
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="flex flex-col items-center justify-start min-h-full py-24 px-4 bg-[#1a1a1a]">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-white/60 font-medium tracking-wide">Preparando documento...</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center max-w-md">
                <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-semibold text-lg">Não foi possível carregar o PDF</p>
                  <p className="text-white/40 text-sm">{error || "Verifique sua conexão ou tente novamente mais tarde."}</p>
                </div>
                <Button variant="outline" className="mt-4 border-white/10 text-white hover:bg-white/5" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </div>
            }
          >
            <div className="shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] bg-white rounded-sm overflow-hidden ring-1 ring-white/5">
              <Page
                pageNumber={pageNumber}
                width={Math.min(containerWidth - 64, 1200)}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="transition-transform duration-200 ease-out"
                loading={
                  <div className="flex items-center justify-center" style={{ width: 800, height: 1100 }}>
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                }
              />
            </div>
          </Document>
        </div>
      </div>

      {/* Progress Bar at bottom */}
      {numPages > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-30">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${(pageNumber / numPages) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
