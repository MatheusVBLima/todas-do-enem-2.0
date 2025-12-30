"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EssayEditor } from "./essay-editor"
import { EssayList } from "./essay-list"
import { EnemCompetencias } from "./enem-competencias"
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { getEssays } from "@/server/actions/essays"
import { queryKeys } from "@/lib/query-keys"

interface RedacaoClientProps {
  userId: string
}

export function RedacaoClient({ userId }: RedacaoClientProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingEssayId, setEditingEssayId] = useState<string | undefined>()
  const queryClient = useQueryClient()

  // Fetch essays with useSuspenseQuery
  const { data: essaysResult } = useSuspenseQuery({
    queryKey: queryKeys.essays.list(userId),
    queryFn: () => getEssays(userId),
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Redação</h1>
      </div>

      <p className="text-muted-foreground">
        Escreva suas redações e receba correção automática por IA seguindo as
        competências do ENEM.
      </p>

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

          <EssayList essays={essays} onEdit={handleEditEssay} />
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
    </div>
  )
}
