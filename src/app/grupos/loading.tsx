import { Skeleton } from "@/components/ui/skeleton"
import { FolderOpen } from "lucide-react"

export default function GruposLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Meus Grupos</h1>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
