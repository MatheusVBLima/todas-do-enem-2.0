"use client"

import { useState } from "react"
import { FileText, Plus, Award, BookText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EssayEditor } from "./essay-editor"
import { EssayList } from "./essay-list"
import { EnemCompetencias } from "./enem-competencias"
import { EssayThemes } from "./essay-themes"
import { ComingSoonDialog } from "@/components/coming-soon-dialog"
import { useQuery } from "@tanstack/react-query"
import { getEssays } from "@/server/actions/essays"
import { queryKeys } from "@/lib/query-keys"

interface RedacaoClientProps {
  userId: string
  userPlan: string
}

export function RedacaoClient({ userId, userPlan }: RedacaoClientProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingEssayId, setEditingEssayId] = useState<string | undefined>()
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false)

  // Fetch essays with hydration + cache reuse
  const { data: essaysResult, isPending } = useQuery({
    queryKey: queryKeys.essays.list(userId),
    queryFn: () => getEssays(userId),
    placeholderData: (prev) => prev,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: (query) => {
      const data = query.state.data
      const hasSubmitted = data?.success && data.data?.some(e => e.status === "SUBMITTED")
      return hasSubmitted ? 5000 : false
    },
  })

  const essays = essaysResult?.success ? essaysResult.data || [] : []

  const handleNewEssay = () => {
    // Show coming soon dialog instead of opening editor
    setShowComingSoonDialog(true)
  }

  const handleEditEssay = (essayId: string) => {
    // Show coming soon dialog instead of opening editor
    setShowComingSoonDialog(true)
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
      {/* Coming Soon Dialog */}
      <ComingSoonDialog
        open={showComingSoonDialog}
        onOpenChange={setShowComingSoonDialog}
        feature="essay-correction"
      />

      {/* Tabs */}
      <Tabs defaultValue="redacoes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="redacoes">
            <FileText className="mr-2 size-4" />
            Minhas Redações
          </TabsTrigger>
          <TabsTrigger value="competencias">
            <Award className="mr-2 size-4" />
            Competências
          </TabsTrigger>
          <TabsTrigger value="temas">
            <BookText className="mr-2 size-4" />
            Temas do ENEM
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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

        {/* Tab: Temas do ENEM */}
        <TabsContent value="temas">
          <EssayThemes />
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
            userPlan={userPlan}
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
