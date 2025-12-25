"use client"

import { useState } from "react"
import { Search, X, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { KNOWLEDGE_AREAS, SUBJECTS, ENEM_YEARS, type KnowledgeAreaKey, type SubjectKey } from "@/lib/constants"
import { useQuestionFilters } from "@/hooks/use-question-filters"

export function QuestionFilters() {
  const [filters, setFilters] = useQuestionFilters()
  const [searchInput, setSearchInput] = useState(filters.busca)

  const activeFiltersCount =
    filters.anos.length + filters.areas.length + filters.disciplinas.length + (filters.busca ? 1 : 0)

  const handleSearch = () => {
    setFilters({ busca: searchInput, pagina: 1 })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const toggleYear = (year: number) => {
    const newYears = filters.anos.includes(year)
      ? filters.anos.filter((y) => y !== year)
      : [...filters.anos, year]
    setFilters({ anos: newYears, pagina: 1 })
  }

  const toggleArea = (area: string) => {
    const newAreas = filters.areas.includes(area)
      ? filters.areas.filter((a) => a !== area)
      : [...filters.areas, area]
    setFilters({ areas: newAreas, pagina: 1 })
  }

  const toggleSubject = (subject: string) => {
    const newSubjects = filters.disciplinas.includes(subject)
      ? filters.disciplinas.filter((s) => s !== subject)
      : [...filters.disciplinas, subject]
    setFilters({ disciplinas: newSubjects, pagina: 1 })
  }

  const clearFilters = () => {
    setSearchInput("")
    setFilters({
      anos: [],
      areas: [],
      disciplinas: [],
      busca: "",
      pagina: 1,
    })
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-medium">Anos</h4>
        <ScrollArea className="h-48">
          <div className="grid grid-cols-3 gap-2">
            {ENEM_YEARS.slice().reverse().map((year) => (
              <div key={year} className="flex items-center space-x-2">
                <Checkbox
                  id={`year-${year}`}
                  checked={filters.anos.includes(year)}
                  onCheckedChange={() => toggleYear(year)}
                />
                <Label htmlFor={`year-${year}`} className="text-sm cursor-pointer">
                  {year}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Areas do Conhecimento</h4>
        <div className="space-y-2">
          {(Object.keys(KNOWLEDGE_AREAS) as KnowledgeAreaKey[]).map((key) => {
            const area = KNOWLEDGE_AREAS[key]
            return (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`area-${key}`}
                  checked={filters.areas.includes(key)}
                  onCheckedChange={() => toggleArea(key)}
                />
                <Label htmlFor={`area-${key}`} className="text-sm cursor-pointer">
                  {area.shortLabel}
                </Label>
              </div>
            )
          })}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Disciplinas</h4>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {(Object.keys(SUBJECTS) as SubjectKey[]).map((key) => {
              const subject = SUBJECTS[key]
              return (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subject-${key}`}
                    checked={filters.disciplinas.includes(key)}
                    onCheckedChange={() => toggleSubject(key)}
                  />
                  <Label htmlFor={`subject-${key}`} className="text-sm cursor-pointer">
                    {subject.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por palavra-chave..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>Buscar</Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="hidden md:flex gap-2">
              <Filter className="size-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filtros</h3>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              )}
            </div>
            <FiltersContent />
          </PopoverContent>
        </Popover>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <Filter className="size-4" />
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                Filtros
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.busca && (
            <Badge variant="secondary" className="gap-1">
              Busca: {filters.busca}
              <button onClick={() => {
                setSearchInput("")
                setFilters({ busca: "", pagina: 1 })
              }}>
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {filters.anos.map((year) => (
            <Badge key={year} variant="secondary" className="gap-1">
              {year}
              <button onClick={() => toggleYear(year)}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {filters.areas.map((area) => (
            <Badge key={area} variant="secondary" className="gap-1">
              {KNOWLEDGE_AREAS[area as KnowledgeAreaKey]?.shortLabel}
              <button onClick={() => toggleArea(area)}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {filters.disciplinas.map((subject) => (
            <Badge key={subject} variant="secondary" className="gap-1">
              {SUBJECTS[subject as SubjectKey]?.label}
              <button onClick={() => toggleSubject(subject)}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Limpar tudo
          </Button>
        </div>
      )}
    </div>
  )
}
