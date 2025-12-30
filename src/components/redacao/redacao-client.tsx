"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EssayEditor } from "./essay-editor"
import { EssayList } from "./essay-list"
import { EnemCompetencias } from "./enem-competencias"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getEssays } from "@/server/actions/essays"
import { queryKeys } from "@/lib/query-keys"

interface RedacaoClientProps {
  userId: string
}

export function RedacaoClient({ userId }: RedacaoClientProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingEssayId, setEditingEssayId] = useState<string | undefined>()
  const queryClient = useQueryClient()

  // Fetch essays with hydration + cache reuse
  const { data: essaysResult, isPending } = useQuery({
    queryKey: queryKeys.essays.list(userId),
    queryFn: () => getEssays(userId),
    placeholderData: (prev) => prev,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const essays = essaysResult?.success ? essaysResult.data || [] : []

  // Auto-refresh when there are essays being corrected
  useEffect(() => {
    const hasSubmittedEssays = essays.some(essay => essay.status === "SUBMITTED")

    if (!hasSubmittedEssays) return

    // Check every 5 seconds for status updates
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.essays.list(userId) })
    }, 5000)

    return () => clearInterval(interval)
  }, [essays, userId, queryClient])

  const handleNewEssay = () => {
    setEditingEssayId(undefined)
    setIsEditorOpen(true)
  }

  const handleEditEssay = (essayId: string) => {
    const essay = essays?.find((e) => e.id === essayId)
    if (!essay) return

    setEditingEssayId(essayId)
    setIsEditorOpen(true)
  }

  const handleEssaySaved = (essayId: string) => {
    // Editor will auto-save, just need to track ID for future saves
    if (!editingEssayId) {
      setEditingEssayId(essayId)
    }
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingEssayId(undefined)
  }

  const editingEssay = editingEssayId
    ? essays?.find((e) => e.id === editingEssayId)
    : undefined

  return (
    <>
      {/* Tabs */}
      <Tabs defaultValue="redacoes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="redacoes">
            <FileText className="mr-2 size-4" />
            Minhas Redações
          </TabsTrigger>
          <TabsTrigger value="competencias">
            <Award className="mr-2 size-4" />
            Competências
          </TabsTrigger>
        </TabsList>

        {/* Tab: Minhas Redações */}
      <TabsContent value="redacoes" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Minhas Redações</h2>
          <Button onClick={handleNewEssay} className="gap-2">
            <Plus className="size-4" />
            Nova Redação
          </Button>
        </div>

        {isPending && !essaysResult ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6 space-y-4 animate-pulse">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="h-4 w-48 bg-muted rounded" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 bg-muted rounded" />
                    <div className="h-4 w-12 bg-muted rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-9 flex-1 bg-muted rounded" />
                  <div className="h-9 w-9 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EssayList essays={essays} onEdit={handleEditEssay} />
        )}
      </TabsContent>

        {/* Tab: Competências do ENEM */}
        <TabsContent value="competencias">
          <EnemCompetencias />
        </TabsContent>
      </Tabs>

      {/* Editor dialog */}
      <Dialog open={isEditorOpen} onOpenChange={handleCloseEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {editingEssayId ? "Editar Redação" : "Nova Redação"}
            </DialogTitle>
          </DialogHeader>
          <EssayEditor
            userId={userId}
            essayId={editingEssayId}
            initialTitle={editingEssay?.title || ""}
            initialTheme={editingEssay?.theme || ""}
            initialContent={editingEssay?.content || ""}
            onSaved={handleEssaySaved}
            onClose={handleCloseEditor}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
