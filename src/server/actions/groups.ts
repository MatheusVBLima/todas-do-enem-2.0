"use server"

import { supabase } from "@/lib/supabase/server"
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
    const { data: groups, error } = await supabase
      .from('QuestionGroup')
      .select('*, questions:QuestionsOnGroups(count)')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })

    if (error) throw error

    // Transform to match Prisma format with _count
    const transformedGroups = (groups || []).map(group => ({
      ...group,
      _count: {
        questions: Array.isArray(group.questions) ? group.questions?.[0]?.count || 0 : 0,
      },
      questions: undefined, // Remove raw questions data
    }))

    return { success: true, data: transformedGroups }
  } catch (error) {
    console.error("Error fetching groups:", error)
    return { success: false, error: "Erro ao buscar grupos" }
  }
}

export async function getGroup(groupId: string) {
  try {
    const { data: group, error } = await supabase
      .from('QuestionGroup')
      .select(`
        *,
        questions:QuestionsOnGroups(
          questionId,
          addedAt,
          question:Question(
            *,
            exam:Exam(*)
          )
        )
      `)
      .eq('id', groupId)
      .order('addedAt', { foreignTable: 'QuestionsOnGroups', ascending: false })
      .single()

    if (error) throw error

    if (!group) {
      return { success: false, error: "Grupo não encontrado" }
    }

    // Add _count manually
    const groupWithCount = {
      ...group,
      _count: {
        questions: group.questions?.length || 0,
      },
    }

    return { success: true, data: groupWithCount }
  } catch (error) {
    console.error("Error fetching group:", error)
    return { success: false, error: "Erro ao buscar grupo" }
  }
}

export async function createGroup(input: CreateGroupInput) {
  try {
    const { data: group, error } = await supabase
      .from('QuestionGroup')
      .insert({
        userId: input.userId,
        name: input.name,
        description: input.description,
        color: input.color || "#6366f1",
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/grupos")
    return { success: true, data: group }
  } catch (error) {
    console.error("Error creating group:", error)
    return { success: false, error: "Erro ao criar grupo" }
  }
}

export async function updateGroup(groupId: string, input: UpdateGroupInput) {
  try {
    const { data: group, error } = await supabase
      .from('QuestionGroup')
      .update(input)
      .eq('id', groupId)
      .select()
      .single()

    if (error) throw error

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
    const { error } = await supabase
      .from('QuestionGroup')
      .delete()
      .eq('id', groupId)

    if (error) throw error

    revalidatePath("/grupos")
    return { success: true }
  } catch (error) {
    console.error("Error deleting group:", error)
    return { success: false, error: "Erro ao deletar grupo" }
  }
}

export async function addQuestionsToGroup(groupId: string, questionIds: string[]) {
  try {
    // Use Promise.allSettled to handle duplicates gracefully
    const results = await Promise.allSettled(
      questionIds.map(questionId =>
        supabase
          .from('QuestionsOnGroups')
          .insert({ groupId, questionId })
      )
    )

    // Count successes (rejected = duplicates, which is fine)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    console.log(`Added ${successCount}/${questionIds.length} questions to group`)

    revalidatePath(`/grupos/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Error adding questions to group:", error)
    return { success: false, error: "Erro ao adicionar questões ao grupo" }
  }
}

export async function removeQuestionFromGroup(groupId: string, questionId: string) {
  try {
    const { error } = await supabase
      .from('QuestionsOnGroups')
      .delete()
      .eq('groupId', groupId)
      .eq('questionId', questionId)

    if (error) throw error

    revalidatePath(`/grupos/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Error removing question from group:", error)
    return { success: false, error: "Erro ao remover questão do grupo" }
  }
}
