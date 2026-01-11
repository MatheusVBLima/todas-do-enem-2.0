"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Calendar, FileText } from "lucide-react"
import { ENEM_ESSAY_THEMES } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"

export function EssayThemes() {
  // Sort by year descending (most recent first)
  const sortedThemes = [...ENEM_ESSAY_THEMES].reverse()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Temas do ENEM</h2>
          <p className="text-sm text-muted-foreground">
            Todos os temas de redação desde 1998
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <FileText className="size-3" />
          {ENEM_ESSAY_THEMES.length} temas
        </Badge>
      </div>

      <ScrollArea className="h-[600px] rounded-lg border">
        <div className="space-y-2 p-4">
          {sortedThemes.map((item) => (
            <Card
              key={item.year}
              className="p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10 shrink-0">
                  <Calendar className="size-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-primary">ENEM {item.year}</p>
                  <p className="text-sm leading-relaxed">{item.theme}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
