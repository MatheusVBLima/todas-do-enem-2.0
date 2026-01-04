import { FileText, Award, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export function RedacaoSkeleton() {
  return (
    <Tabs defaultValue="redacoes" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
        <TabsTrigger value="redacoes">
          <FileText className="mr-2 size-4" />
          Minhas Redacoes
        </TabsTrigger>
        <TabsTrigger value="competencias">
          <Award className="mr-2 size-4" />
          Competencias
        </TabsTrigger>
      </TabsList>

      <TabsContent value="redacoes" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Minhas Redacoes</h2>
          <Button disabled className="gap-2">
            <Plus className="size-4" />
            Nova Redacao
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
