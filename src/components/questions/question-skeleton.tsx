import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function QuestionSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader className="pb-3">
          {/* Header com badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-32" /> {/* Area badge */}
              <Skeleton className="h-6 w-24" /> {/* Subject badge */}
              <Skeleton className="h-6 w-20" /> {/* Year badge */}
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-md" /> {/* Add to group */}
              <Skeleton className="h-9 w-9 rounded-md" /> {/* Remove button */}
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-6">
          {/* Context section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" /> {/* "Contexto" title */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Supporting materials (opcional) */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" /> {/* "Textos de Apoio" */}
            <Skeleton className="h-48 w-full rounded-lg" /> {/* Image/text */}
          </div>

          {/* Statement */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" /> {/* "Enunciado" */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" /> {/* "Alternativas" */}
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-4"
                >
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Skeleton className="h-10 w-40" /> {/* Reveal answer button */}
            <Skeleton className="h-10 w-48" /> {/* AI explanation button */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
