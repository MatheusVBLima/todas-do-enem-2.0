"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { CommandDialog, CommandEmpty } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { getQuestions } from "@/server/actions/questions"
import { queryKeys } from "@/lib/query-keys"
import { usePrefetchQuestion } from "@/hooks/use-prefetch-question"

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
        <div className="flex h-9 items-center gap-2 border-b px-3">
          <Search className="size-4 shrink-0 opacity-50" />
          <input
            placeholder="Digite para buscar questões..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="min-h-[300px] max-h-[300px]">
          <ScrollArea className="h-[300px]">
            <div className="p-1">
              {/* Estado 1: Vazio (sem busca) */}
              {debouncedSearch.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Digite para buscar questões...
                </div>
              )}

              {/* Estado 2: Busca muito curta */}
              {debouncedSearch.length > 0 && debouncedSearch.length < 3 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Digite pelo menos 3 caracteres para buscar
                </div>
              )}

              {/* Estado 3: Loading */}
              {isLoading && debouncedSearch.length >= 3 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Buscando...
                </div>
              )}

              {/* Estado 4: Sem resultados */}
              {!isLoading && questions.length === 0 && debouncedSearch.length >= 3 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Nenhuma questão encontrada
                </div>
              )}

              {/* Estado 5: Com resultados */}
              {!isLoading && questions.length > 0 && (
                <div className="text-foreground">
                  <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                    Questões
                  </div>
                  {questions.map((question) => (
                    <button
                      key={question.id}
                      onClick={() => handleSelect(question.id)}
                      onMouseEnter={() => {
                        prefetchQuestion(question.id)
                        router.prefetch(`/${question.id}`)
                      }}
                      className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{question.exam.year}</Badge>
                          <Badge variant="secondary">Q{question.questionNumber}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {question.knowledgeArea}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 text-left">
                          {question.subject}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CommandDialog>
    </>
  )
}
