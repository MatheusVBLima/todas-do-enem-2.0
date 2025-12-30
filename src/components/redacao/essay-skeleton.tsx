import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function EssaySkeleton() {
  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-9 w-3/4" /> {/* Title */}
            <Skeleton className="h-5 w-1/2" /> {/* Theme */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" /> {/* Edit button */}
            <Skeleton className="h-10 w-32" /> {/* Export button */}
          </div>
        </div>

        <Separator />

        {/* Essay content */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" /> {/* "Redação" */}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" /> {/* Label */}
                <Skeleton className="h-8 w-16" /> {/* Value */}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competences */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" /> {/* "Competências" */}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-2/3" /> {/* Competence name */}
                  <Skeleton className="h-6 w-16" /> {/* Score */}
                </div>
                <Skeleton className="h-2 w-full rounded-full" /> {/* Progress bar */}
                <Skeleton className="h-4 w-full" /> {/* Feedback line 1 */}
                <Skeleton className="h-4 w-5/6" /> {/* Feedback line 2 */}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Total score */}
        <Card className="border-primary">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-32" /> {/* "Nota Total" */}
              <Skeleton className="h-10 w-24" /> {/* Score value */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
