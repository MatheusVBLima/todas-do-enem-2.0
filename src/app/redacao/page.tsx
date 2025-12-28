"use client"

import { useState } from "react"
import { FileText, Plus, Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, hasPaidPlan } from "@/lib/dev-user"
import { RedacaoClient } from "@/components/redacao/redacao-client"
import { UpgradeDialog } from "@/components/upgrade-dialog"

export default function RedacaoPage() {
  const user = getCurrentUser()
  const isPaidUser = hasPaidPlan(user.plan)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  if (!isPaidUser) {
    return (
      <div className="space-y-6">
        <UpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          feature="essay-correction"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="size-6 text-primary" />
            <h1 className="text-2xl font-bold">Redação</h1>
            <Badge variant="secondary" className="gap-1">
              <Lock className="size-3" />
              PRO
            </Badge>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8 text-center">
          <Lock className="mx-auto size-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            Recurso exclusivo do plano Rumo à Aprovação
          </h2>
          <p className="text-muted-foreground mb-4">
            Faça upgrade para ter acesso à correção de redação por IA com feedback
            detalhado por competência.
          </p>
          <Button onClick={() => setShowUpgradeDialog(true)}>
            <Sparkles className="mr-2 size-4" />
            Fazer Upgrade
          </Button>
        </div>
      </div>
    )
  }

  return <RedacaoClient userId={user.id} />
}
