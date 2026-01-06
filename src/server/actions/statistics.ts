"use server"

import { supabase } from "@/lib/supabase/server"
import { getTodayBrazil, todayBrazilDateString, todayBrazilISOString } from "@/lib/timezone"

export interface UserStatistics {
  questionsAnswered: number
  correctAnswers: number
  accuracyRate: number
  currentStreak: number
  performanceByArea: {
    area: string
    total: number
    correct: number
    accuracyRate: number
  }[]
}

export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get user statistics including questions answered, accuracy rate, streak, and performance by area
 */
export async function getUserStatistics(userId: string): Promise<ActionResponse<UserStatistics>> {
  try {
    // Get total statistics
    const { data: totalStats, error: totalError } = await supabase
      .rpc('get_user_total_statistics', { p_user_id: userId })
      .single()

    if (totalError) {
      console.error('[getUserStatistics] Total stats error:', totalError)
      // Return empty stats if no data
      return {
        success: true,
        data: {
          questionsAnswered: 0,
          correctAnswers: 0,
          accuracyRate: 0,
          currentStreak: 0,
          performanceByArea: [],
        },
      }
    }

    // Get streak (days consecutive)
    const streak = await calculateStreak(userId)

    // Get performance by area
    const { data: areaStats, error: areaError } = await supabase
      .rpc('get_user_performance_by_area', { p_user_id: userId })

    if (areaError) {
      console.error('[getUserStatistics] Area stats error:', areaError)
    }

    const performanceByArea = (areaStats || []).map((row: {
      area: string
      total: number
      correct: number
    }) => ({
      area: row.area,
      total: row.total,
      correct: row.correct,
      accuracyRate: row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0,
    }))

    const questionsAnswered = totalStats?.total_answered || 0
    const correctAnswers = totalStats?.correct_answers || 0
    const accuracyRate = questionsAnswered > 0
      ? Math.round((correctAnswers / questionsAnswered) * 100)
      : 0

    return {
      success: true,
      data: {
        questionsAnswered,
        correctAnswers,
        accuracyRate,
        currentStreak: streak,
        performanceByArea,
      },
    }
  } catch (error) {
    console.error('[getUserStatistics] Error:', error)
    return {
      success: false,
      error: 'Erro ao carregar estatísticas',
    }
  }
}

/**
 * Calculate the current streak (consecutive days with at least one answer)
 */
async function calculateStreak(userId: string): Promise<number> {
  try {
    const { data: days, error } = await supabase
      .from('SimuladoQuestao')
      .select(`
        answeredAt,
        Simulado!inner(userId)
      `)
      .eq('Simulado.userId', userId)
      .not('answeredAt', 'is', null)
      .order('answeredAt', { ascending: false })

    if (error || !days || days.length === 0) {
      return 0
    }

    // Get unique dates (in local timezone)
    const uniqueDates = [...new Set(
      days
        .filter(d => d.answeredAt !== null)
        .map(d => {
          const date = new Date(d.answeredAt!)
          return date.toISOString().split('T')[0]
        })
    )].sort((a, b) => b.localeCompare(a)) // Sort descending

    if (uniqueDates.length === 0) return 0

    // Get today and yesterday dates using Brazilian timezone
    const today = getTodayBrazil()
    const todayStr = todayBrazilDateString()

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Check if user studied today or yesterday to start the streak
    const firstDate = uniqueDates[0]
    if (firstDate !== todayStr && firstDate !== yesterdayStr) {
      // No study in the last 2 days, streak is broken
      return 0
    }

    // Count consecutive days
    let streak = 1
    let currentDate = new Date(firstDate)

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(currentDate)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateStr = prevDate.toISOString().split('T')[0]

      if (uniqueDates[i] === prevDateStr) {
        streak++
        currentDate = prevDate
      } else {
        break // Gap found, stop counting
      }
    }

    return streak
  } catch (error) {
    console.error('[calculateStreak] Error:', error)
    return 0
  }
}

/**
 * Get today's progress for daily goal
 */
export async function getTodayProgress(userId: string): Promise<ActionResponse<{ answered: number }>> {
  try {
    // Get today's start timestamp using Brazilian timezone
    const todayStr = todayBrazilISOString()

    const { count, error } = await supabase
      .from('SimuladoQuestao')
      .select('*, Simulado!inner(userId)', { count: 'exact', head: true })
      .eq('Simulado.userId', userId)
      .gte('answeredAt', todayStr)
      .not('answeredAt', 'is', null)

    if (error) {
      console.error('[getTodayProgress] Error:', error)
      return { success: false, error: 'Erro ao carregar progresso' }
    }

    return {
      success: true,
      data: { answered: count || 0 },
    }
  } catch (error) {
    console.error('[getTodayProgress] Error:', error)
    return { success: false, error: 'Erro ao carregar progresso' }
  }
}
