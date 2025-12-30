"use client"

import { useState } from "react"
import { FolderOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { GroupCard } from "@/components/groups/group-card"
import { GroupFormDialog } from "@/components/groups/group-form-dialog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserGroups, createGroup, updateGroup, deleteGroup } from "@/server/actions/groups"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query-keys"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GroupsClientProps {
  userId: string | null
}

export function GroupsClient({ userId }: GroupsClientProps) {
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)

  if (!userId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Faça login para ver seus grupos</EmptyTitle>
          <EmptyDescription>
            Conecte-se para criar e gerenciar seus grupos de questões.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const { data: groupsResult, isPending } = useQuery({
    queryKey: queryKeys.groups.list(userId),
    queryFn: () => getUserGroups(userId),
    placeholderData: (prev) => prev,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; color: string }) =>
      createGroup({ userId, ...data }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
        toast.success("Grupo criado com sucesso!")
      } else {
        toast.error(result.error || "Erro ao criar grupo")
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string
      data: { name?: string; description?: string; color?: string }
    }) => updateGroup(groupId, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
        toast.success("Grupo atualizado com sucesso!")
      } else {
        toast.error(result.error || "Erro ao atualizar grupo")
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (groupId: string) => deleteGroup(groupId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.groups.all })
        toast.success("Grupo deletado com sucesso!")
      } else {
        toast.error(result.error || "Erro ao deletar grupo")
      }
    },
  })

  const groups = groupsResult?.success ? groupsResult.data : []

  return (
    <>
      <div className="flex items-center justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4" />
          Novo Grupo
        </Button>
      </div>

      {!groups || groups.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Nenhum grupo criado ainda</EmptyTitle>
            <EmptyDescription>
              Crie seu primeiro grupo para começar a organizar suas questões
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Criar Primeiro Grupo
          </Button>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={() => {
                setSelectedGroup(group)
                setIsEditDialogOpen(true)
              }}
              onDelete={() => {
                setSelectedGroup(group)
                setIsDeleteDialogOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {isPending && !groupsResult && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="size-10 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 rounded bg-muted" />
                    <div className="h-4 w-48 rounded bg-muted" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-8 w-8 rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      <GroupFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data)
        }}
        title="Criar Novo Grupo"
        description="Organize suas questões em grupos personalizados para estudar melhor."
      />

      <GroupFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={selectedGroup}
        onSubmit={async (data) => {
          if (selectedGroup) {
            await updateMutation.mutateAsync({ groupId: selectedGroup.id, data })
          }
        }}
        title="Editar Grupo"
        description="Atualize as informações do seu grupo."
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O grupo "{selectedGroup?.name}" será deletado
              permanentemente, mas as questões não serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (selectedGroup) {
                  await deleteMutation.mutateAsync(selectedGroup.id)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
