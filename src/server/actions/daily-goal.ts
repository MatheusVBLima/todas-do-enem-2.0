"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase/server"
import { todayBrazilISOString } from "@/lib/timezone"

export interface DailyGoalProgress {
  goal: number
  answered: number
  percentage: number
  isCompleted: boolean
}

export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get user's daily goal setting
 */
export async function getUserDailyGoal(userId: string): Promise<ActionResponse<number>> {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('dailyGoal')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('[getUserDailyGoal] Error:', error)
      return { success: false, error: 'Erro ao carregar meta diária' }
    }

    return {
      success: true,
      data: data?.dailyGoal ?? 10,
    }
  } catch (error) {
    console.error('[getUserDailyGoal] Error:', error)
    return { success: false, error: 'Erro ao carregar meta diária' }
  }
}

/**
 * Update user's daily goal
 */
export async function updateDailyGoal(
  userId: string,
  goal: number
): Promise<ActionResponse<void>> {
  try {
    // Validate goal value
    const validGoals = [5, 10, 15, 20, 30, 50]
    if (!validGoals.includes(goal)) {
      return { success: false, error: 'Meta inválida' }
    }

    const { error } = await supabase
      .from('User')
      .update({ dailyGoal: goal })
      .eq('id', userId)

    if (error) {
      console.error('[updateDailyGoal] Error:', error)
      return { success: false, error: 'Erro ao atualizar meta diária' }
    }

    revalidatePath('/conta')
    return { success: true }
  } catch (error) {
    console.error('[updateDailyGoal] Error:', error)
    return { success: false, error: 'Erro ao atualizar meta diária' }
  }
}

/**
 * Get user's daily goal progress for today
 */
export async function getDailyGoalProgress(userId: string): Promise<ActionResponse<DailyGoalProgress>> {
  try {
    // Get user's goal setting
    const goalResult = await getUserDailyGoal(userId)
    const goal = goalResult.data ?? 10

    // Get today's start timestamp using Brazilian timezone
    const todayStr = todayBrazilISOString()

    // Count questions answered today
    const { count, error } = await supabase
      .from('SimuladoQuestao')
      .select('*, Simulado!inner(userId)', { count: 'exact', head: true })
      .eq('Simulado.userId', userId)
      .gte('answeredAt', todayStr)
      .not('answeredAt', 'is', null)

    if (error) {
      console.error('[getDailyGoalProgress] Error:', error)
      return { success: false, error: 'Erro ao carregar progresso' }
    }

    const answered = count || 0
    const percentage = Math.min(100, Math.round((answered / goal) * 100))
    const isCompleted = answered >= goal

    return {
      success: true,
      data: {
        goal,
        answered,
        percentage,
        isCompleted,
      },
    }
  } catch (error) {
    console.error('[getDailyGoalProgress] Error:', error)
    return { success: false, error: 'Erro ao carregar progresso' }
  }
}
