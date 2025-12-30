import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function EssayDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled>
              <ArrowLeft className="size-4" />
            </Button>
            <div className="space-y-2 flex-1">
              <Skeleton className="h-9 w-96" /> {/* Title */}
              <Skeleton className="h-5 w-64" /> {/* Theme */}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" /> {/* Edit button */}
          <Skeleton className="h-10 w-10" /> {/* Print button */}
        </div>
      </div>

      {/* Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-24" /> {/* Total score */}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Competences */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" /> {/* Progress bar */}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Essay Content */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>

      {/* Feedback Cards */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
