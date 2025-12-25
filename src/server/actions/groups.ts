"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type CreateGroupInput = {
  userId: string
  name: string
  description?: string
  color?: string
}

export type UpdateGroupInput = {
  name?: string
  description?: string
  color?: string
}

export async function getUserGroups(userId: string) {
  try {
    const groups = await db.questionGroup.findMany({
      where: { userId },
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: groups }
  } catch (error) {
    console.error("Error fetching groups:", error)
    return { success: false, error: "Erro ao buscar grupos" }
  }
}

export async function getGroup(groupId: string) {
  try {
    const group = await db.questionGroup.findUnique({
      where: { id: groupId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                exam: true,
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
        _count: {
          select: { questions: true },
        },
      },
    })

    if (!group) {
      return { success: false, error: "Grupo não encontrado" }
    }

    return { success: true, data: group }
  } catch (error) {
    console.error("Error fetching group:", error)
    return { success: false, error: "Erro ao buscar grupo" }
  }
}

export async function createGroup(input: CreateGroupInput) {
  try {
    const group = await db.questionGroup.create({
      data: {
        userId: input.userId,
        name: input.name,
        description: input.description,
        color: input.color || "#6366f1",
      },
    })

    revalidatePath("/grupos")
    return { success: true, data: group }
  } catch (error) {
    console.error("Error creating group:", error)
    return { success: false, error: "Erro ao criar grupo" }
  }
}

export async function updateGroup(groupId: string, input: UpdateGroupInput) {
  try {
    const group = await db.questionGroup.update({
      where: { id: groupId },
      data: input,
    })

    revalidatePath("/grupos")
    revalidatePath(`/grupos/${groupId}`)
    return { success: true, data: group }
  } catch (error) {
    console.error("Error updating group:", error)
    return { success: false, error: "Erro ao atualizar grupo" }
  }
}

export async function deleteGroup(groupId: string) {
  try {
    await db.questionGroup.delete({
      where: { id: groupId },
    })

    revalidatePath("/grupos")
    return { success: true }
  } catch (error) {
    console.error("Error deleting group:", error)
    return { success: false, error: "Erro ao deletar grupo" }
  }
}

export async function addQuestionsToGroup(groupId: string, questionIds: string[]) {
  try {
    // Add questions one by one to handle duplicates gracefully
    for (const questionId of questionIds) {
      try {
        await db.questionsOnGroups.create({
          data: {
            groupId,
            questionId,
          },
        })
      } catch (err) {
        // Ignore duplicate errors
        console.log("Question already in group, skipping")
      }
    }

    revalidatePath(`/grupos/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Error adding questions to group:", error)
    return { success: false, error: "Erro ao adicionar questões ao grupo" }
  }
}

export async function removeQuestionFromGroup(groupId: string, questionId: string) {
  try {
    await db.questionsOnGroups.delete({
      where: {
        questionId_groupId: {
          questionId,
          groupId,
        },
      },
    })

    revalidatePath(`/grupos/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Error removing question from group:", error)
    return { success: false, error: "Erro ao remover questão do grupo" }
  }
}
