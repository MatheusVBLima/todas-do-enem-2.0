import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function GroupSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="space-y-6">
        {/* Header com título e ações */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" /> {/* Color indicator */}
              <Skeleton className="h-8 w-64" /> {/* Group name */}
            </div>
            <Skeleton className="h-4 w-96" /> {/* Description */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" /> {/* Export PDF button */}
            <Skeleton className="h-10 w-32" /> {/* Edit button */}
          </div>
        </div>

        {/* Stats/Info */}
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-6 w-40" /> {/* Question count */}
          <Skeleton className="h-6 w-32" /> {/* Created date */}
        </div>

        {/* Question list */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-6 w-32" /> {/* Area badge */}
                    <Skeleton className="h-6 w-24" /> {/* Subject badge */}
                    <Skeleton className="h-6 w-20" /> {/* Year badge */}
                  </div>
                  <Skeleton className="h-9 w-9 rounded-md" /> {/* Remove button */}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Context */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>

                {/* Statement */}
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
