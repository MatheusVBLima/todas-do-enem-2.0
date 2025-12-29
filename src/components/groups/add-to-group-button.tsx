"use client"

import { useState } from "react"
import { FolderPlus, Check, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserGroups, addQuestionsToGroup, createGroup } from "@/server/actions/groups"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { GroupFormDialog } from "./group-form-dialog"
import { queryKeys } from "@/lib/query-keys"
import Link from "next/link"

type AddToGroupButtonProps = {
  questionId: string
  userId: string | null
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function AddToGroupButton({
  questionId,
  userId,
  variant = "outline",
  size = "sm",
}: AddToGroupButtonProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())

  // If user is not logged in, show login prompt
  if (!userId) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={variant} size={size}>
            <FolderPlus className="size-4" />
            {size !== "icon" && "Adicionar ao Grupo"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login necessário</DialogTitle>
            <DialogDescription>
              Você precisa estar logado para adicionar questões aos seus grupos de estudo
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 size-4" />
                Fazer login
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Criar conta</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const { data: groupsResult, isLoading } = useQuery({
    queryKey: queryKeys.groups.list(userId),
    queryFn: () => getUserGroups(userId),
    enabled: open,
  })

  const addMutation = useMutation({
    mutationFn: (groupId: string) => addQuestionsToGroup(groupId, [questionId]),
    onSuccess: (result, groupId) => {
      if (result.success) {
        setSelectedGroups((prev) => new Set(prev).add(groupId))
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
        toast.success("Questão adicionada ao grupo!")
      } else {
        toast.error(result.error || "Erro ao adicionar questão")
      }
    },
  })

  const groups = groupsResult?.success ? groupsResult.data : []

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <FolderPlus className="size-4" />
          {size !== "icon" && "Adicionar ao Grupo"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar ao Grupo</DialogTitle>
          <DialogDescription>
            Selecione um ou mais grupos para adicionar esta questão
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2 py-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : !groups || groups.length === 0 ? (
          <div className="py-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Você ainda não tem grupos criados
            </p>
            <Button
              onClick={() => {
                setOpen(false)
                setShowCreateDialog(true)
              }}
            >
              Criar Primeiro Grupo
            </Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {groups.map((group: any) => {
                const isSelected = selectedGroups.has(group.id)

                return (
                  <button
                    key={group.id}
                    onClick={() => addMutation.mutate(group.id)}
                    disabled={isSelected || addMutation.isPending}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                      isSelected && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {group._count.questions}{" "}
                          {group._count.questions === 1 ? "questão" : "questões"}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Badge variant="outline" className="gap-1">
                        <Check className="size-3" />
                        Adicionada
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>

    <GroupFormDialog
      open={showCreateDialog}
      onOpenChange={setShowCreateDialog}
      title="Criar Novo Grupo"
      description="Organize suas questões favoritas em grupos personalizados"
      onSubmit={async (data) => {
        const result = await createGroup({
          userId,
          name: data.name,
          description: data.description,
          color: data.color,
        })

        if (result.success) {
          toast.success("Grupo criado com sucesso!")
          queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
        } else {
          toast.error(result.error || "Erro ao criar grupo")
        }
      }}
    />
  </>
  )
}
