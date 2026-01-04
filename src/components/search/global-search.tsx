"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { CommandDialog } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { getQuestions } from "@/server/actions/questions"
import { queryKeys } from "@/lib/query-keys"
import { usePrefetchQuestion } from "@/hooks/use-prefetch-question"
import { KNOWLEDGE_AREAS, KnowledgeAreaKey } from "@/lib/constants"
import { capitalizeSentences } from "@/lib/text-utils"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const router = useRouter()
  const prefetchQuestion = usePrefetchQuestion()

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Debounce search input to avoid flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [search])

  // Search questions when user types (using debounced value)
  const { data: searchResults, isLoading } = useQuery({
    queryKey: queryKeys.questions.list({
      busca: debouncedSearch,
      pagina: 1,
      anos: [],
      areas: [],
      disciplinas: [],
    }),
    queryFn: () => getQuestions({
      busca: debouncedSearch,
      pagina: 1,
      anos: [],
      areas: [],
      disciplinas: [],
    }),
    enabled: debouncedSearch.length > 2, // Only search when 3+ characters
    gcTime: 0, // Don't cache - always fetch fresh
    staleTime: 0, // Consider data stale immediately
  })

  const handleSelect = useCallback(async (questionId: string) => {
    setOpen(false)
    setSearch("")
    setDebouncedSearch("")
    // Prefetch data + route to evitar flash/suspense
    await prefetchQuestion(questionId)
    router.prefetch(`/${questionId}`)
    router.push(`/${questionId}`)
  }, [prefetchQuestion, router])

  // Clear search when closing dialog
  const handleOpenChange = useCallback((open: boolean) => {
    setOpen(open)
    if (!open) {
      setSearch("")
      setDebouncedSearch("")
    }
  }, [])

  const questions = searchResults?.data || []

  return (
    <>
      <Button
        variant="outline"
        className="relative justify-start text-sm text-muted-foreground md:w-10 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4 lg:mr-2" />
        <span className="hidden lg:inline-flex">Buscar questões...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <div className="flex items-center border-b px-3">
          <Search className="size-4 shrink-0 opacity-50" />
          <input
            placeholder="Digite para buscar questões pelo enunciado, assunto ou ano..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="placeholder:text-muted-foreground flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="min-h-[300px] max-h-[300px]">
          <ScrollArea className="h-[300px]">
            <div className="p-1">
              {/* Estado 3: Loading */}
              {isLoading && debouncedSearch.length >= 3 && (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Buscando...
                </div>
              )}

              {/* Estado 4: Sem resultados */}
              {!isLoading && questions.length === 0 && debouncedSearch.length >= 3 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">Nenhuma questão encontrada para &quot;{debouncedSearch}&quot;</p>
                </div>
              )}

              {/* Estado 5: Com resultados */}
              {!isLoading && questions.length > 0 && (
                <div className="space-y-1 p-1">
                  <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium uppercase tracking-wider">
                    Questões encontradas
                  </div>
                  {questions.map((question) => {
                    const area = KNOWLEDGE_AREAS[question.knowledgeArea as KnowledgeAreaKey]
                    return (
                      <button
                        key={question.id}
                        onClick={() => handleSelect(question.id)}
                        onMouseEnter={() => {
                          prefetchQuestion(question.id)
                          router.prefetch(`/${question.id}`)
                        }}
                        className="group relative flex w-full cursor-pointer items-start gap-3 rounded-lg border border-transparent px-3 py-3 text-sm transition-all hover:bg-accent hover:border-border overflow-hidden"
                      >
                        {/* Borda lateral colorida indicando a área */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1 opacity-70 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: area?.color || 'gray' }}
                        />
                        
                        <div className="flex flex-1 flex-col gap-2 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground tabular-nums tracking-tight">
                              {question.exam.year} • Q{question.questionNumber}
                            </span>
                            <Badge 
                              variant="outline" 
                              className="text-[10px] h-4 px-1.5 font-semibold bg-background/50 border-muted-foreground/20"
                              style={{ 
                                color: area?.color,
                                borderColor: `${area?.color}33`,
                                backgroundColor: `${area?.color}11`
                              }}
                            >
                              {area?.shortLabel || question.knowledgeArea}
                            </Badge>
                            {question.subject && (
                              <span className="text-[10px] text-muted-foreground/70 uppercase font-medium truncate">
                                {question.subject}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2 text-left leading-relaxed">
                            {capitalizeSentences(question.statement)}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CommandDialog>
    </>
  )
}
