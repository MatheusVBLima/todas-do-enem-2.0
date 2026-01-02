import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Skeleton para a lista de histórico de simulados
export function SimuladoHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left side - Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-48" /> {/* Name */}
                  <Skeleton className="h-5 w-20 rounded-full" /> {/* Status badge */}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton className="h-4 w-28" /> {/* Questions count */}
                  <Skeleton className="h-4 w-32" /> {/* Date */}
                  <Skeleton className="h-4 w-24" /> {/* Time */}
                </div>
              </div>

              {/* Right side - Score */}
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-10 w-16 mx-auto" /> {/* Score */}
                  <Skeleton className="h-3 w-20 mt-1" /> {/* Label */}
                </div>
                <Skeleton className="hidden sm:block h-8 w-8" /> {/* Trophy */}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Skeleton para a página de sessão do simulado
export function SimuladoSessionSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 border-b bg-background">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-48" /> {/* Name */}
            <Skeleton className="h-5 w-16 rounded-full" /> {/* Question count */}
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-full" /> {/* Timer */}
            <Skeleton className="h-9 w-24" /> {/* Abandon button */}
            <Skeleton className="h-9 w-24" /> {/* Finish button */}
          </div>
        </div>
        <Skeleton className="h-1 w-full" /> {/* Progress bar */}
      </div>

      {/* Main content */}
      <div className="container py-6 max-w-4xl">
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Context */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>

            {/* Statement */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>

            {/* Options */}
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Skeleton className="h-10 w-28" /> {/* Prev button */}
          <div className="flex flex-wrap gap-1 max-w-md justify-center">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded" />
            ))}
          </div>
          <Skeleton className="h-10 w-28" /> {/* Next button */}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para a página de resultados
export function SimuladoResultSkeleton() {
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-28" /> {/* Back button */}
        <Skeleton className="h-5 w-20 rounded-full" /> {/* Status badge */}
      </div>

      {/* Main Score Card */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" /> {/* Name */}
              <Skeleton className="h-4 w-48" /> {/* Info */}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Skeleton className="h-12 w-20" /> {/* Score */}
                <Skeleton className="h-3 w-24 mt-1" /> {/* Label */}
              </div>
              <Skeleton className="h-12 w-12" /> {/* Trophy */}
            </div>
          </div>
        </div>

        <CardContent className="pt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
                <Skeleton className="h-6 w-6 mx-auto mb-2" />
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score by Area */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" /> {/* Title */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  )
}
