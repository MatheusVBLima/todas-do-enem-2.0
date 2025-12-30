import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function QuestionListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Results count and view toggle skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" /> {/* "Mostrando X de Y questões" */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" /> {/* Cards view button */}
          <Skeleton className="h-9 w-9 rounded-md" /> {/* Table view button */}
        </div>
      </div>

      {/* Question cards skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-6 w-32" /> {/* Knowledge area badge */}
                  <Skeleton className="h-6 w-24" /> {/* Subject badge */}
                  <Skeleton className="h-6 w-20" /> {/* Year badge */}
                </div>
                <Skeleton className="h-9 w-9 rounded-md" /> {/* Add to group button */}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Context section */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>

              {/* Statement section */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Options preview */}
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 w-32" /> {/* Ver questão button */}
                <Skeleton className="h-9 w-40" /> {/* Adicionar ao grupo button */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" /> {/* Previous button */}
        <Skeleton className="h-5 w-40" /> {/* Page info */}
        <Skeleton className="h-10 w-32" /> {/* Next button */}
      </div>
    </div>
  )
}
