"use client"

import { Filter, Calendar, BookOpen, RotateCcw, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useProofFilters } from "@/hooks/use-proof-filters"
import { ENEM_YEARS } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function ProofFilters({ className }: { className?: string }) {
  const [filters, setFilters] = useProofFilters()
  const { anos, tipo } = filters

  const activeFiltersCount = anos.length + (tipo ? 1 : 0)

  const toggleYear = (year: number) => {
    const newYears = anos.includes(year)
      ? anos.filter((y) => y !== year)
      : [...anos, year]
    setFilters({ anos: newYears, pagina: 1 })
  }

  const handleTipoChange = (value: string) => {
    setFilters({ tipo: value === "all" ? null : value, pagina: 1 })
  }

  const clearFilters = () => {
    setFilters({
      anos: [],
      tipo: null,
      pagina: 1,
    })
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-medium">Tipo de Prova</h4>
        <Select value={tipo || "all"} onValueChange={handleTipoChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas as provas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as provas</SelectItem>
            <SelectItem value="COMPLETA">Caderno Completo</SelectItem>
            <SelectItem value="1º dia">1º Dia (Linguagens/Humanas)</SelectItem>
            <SelectItem value="2º dia">2º Dia (Natureza/Matemática)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h4 className="mb-3 text-sm font-medium">Anos</h4>
        <ScrollArea className="h-48">
          <div className="grid grid-cols-2 gap-2">
            {[...ENEM_YEARS].sort((a, b) => b - a).map((year) => (
              <div key={year} className="flex items-center space-x-2">
                <Checkbox
                  id={`year-${year}`}
                  checked={anos.includes(year)}
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
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
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
          <PopoverContent className="w-80" align="start">
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

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-xs text-muted-foreground hover:text-primary hidden md:flex"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {tipo && (
            <Badge variant="secondary" className="gap-1">
              Tipo: {tipo}
              <button onClick={() => setFilters({ tipo: null, pagina: 1 })}>
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {anos.sort((a, b) => b - a).map((year) => (
            <Badge key={year} variant="secondary" className="gap-1">
              {year}
              <button onClick={() => toggleYear(year)}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs md:hidden">
            Limpar tudo
          </Button>
        </div>
      )}
    </div>
  )
}
