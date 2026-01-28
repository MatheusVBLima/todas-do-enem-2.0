"use server"

import { supabase } from "@/lib/supabase/server"
import { getTodayBrazil, todayBrazilDateString, todayBrazilISOString } from "@/lib/timezone"
import type { TopicPerformance, UrgencyLevel } from "@/types"

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

// Map area code to full knowledge area name
const AREA_CODE_TO_NAME: Record<string, string> = {
  'LINGUAGENS': 'Linguagens',
  'CIENCIAS_HUMANAS': 'Ciências Humanas',
  'CIENCIAS_NATUREZA': 'Ciências da Natureza',
  'MATEMATICA': 'Matemática',
}

// Map subject code to display name
const SUBJECT_CODE_TO_NAME: Record<string, string> = {
  'PORTUGUES': 'Português',
  'LITERATURA': 'Literatura',
  'INGLES': 'Inglês',
  'ESPANHOL': 'Espanhol',
  'ARTES': 'Artes',
  'EDUCACAO_FISICA': 'Educação Física',
  'HISTORIA': 'História',
  'GEOGRAFIA': 'Geografia',
  'FILOSOFIA': 'Filosofia',
  'SOCIOLOGIA': 'Sociologia',
  'BIOLOGIA': 'Biologia',
  'FISICA': 'Física',
  'QUIMICA': 'Química',
  'MATEMATICA': 'Matemática',
}

/**
 * Get user performance by topic (for study priority card)
 * Uses QuestionTopic and Topic tables from database
 */
export async function getUserPerformanceByTopic(userId: string): Promise<ActionResponse<TopicPerformance[]>> {
  try {
    // Fetch answered questions with their topics from the database
    const { data: answers, error } = await supabase
      .from('SimuladoQuestao')
      .select(`
        isCorrect,
        questionId,
        Simulado!inner(userId)
      `)
      .eq('Simulado.userId', userId)
      .not('userAnswer', 'is', null)

    if (error) {
      console.error('[getUserPerformanceByTopic] Error fetching answers:', error)
      return { success: false, error: 'Erro ao carregar respostas' }
    }

    if (!answers || answers.length === 0) {
      return { success: true, data: [] }
    }

    // Get unique question IDs
    const questionIds = [...new Set(answers.map(a => a.questionId))]

    // Fetch topics for all answered questions
    const { data: questionTopics, error: topicsError } = await supabase
      .from('QuestionTopic')
      .select(`
        questionId,
        Topic!inner(
          name,
          subject,
          knowledgeArea
        )
      `)
      .in('questionId', questionIds)

    if (topicsError) {
      console.error('[getUserPerformanceByTopic] Error fetching topics:', topicsError)
      return { success: false, error: 'Erro ao carregar tópicos' }
    }

    // Build a map of questionId -> topics
    const questionTopicMap = new Map<string, Array<{
      name: string
      subject: string
      knowledgeArea: string
    }>>()

    for (const qt of questionTopics || []) {
      const topic = (qt as any).Topic
      if (!topic) continue

      if (!questionTopicMap.has(qt.questionId)) {
        questionTopicMap.set(qt.questionId, [])
      }
      questionTopicMap.get(qt.questionId)!.push({
        name: topic.name,
        subject: topic.subject,
        knowledgeArea: topic.knowledgeArea,
      })
    }

    // Aggregate by topic
    const topicStats = new Map<string, {
      topic: string
      subject: string
      knowledgeArea: string
      total: number
      correct: number
    }>()

    for (const answer of answers) {
      const topics = questionTopicMap.get(answer.questionId)
      if (!topics || topics.length === 0) continue

      for (const topic of topics) {
        const key = `${topic.name}_${topic.subject}_${topic.knowledgeArea}`
        if (!topicStats.has(key)) {
          topicStats.set(key, {
            topic: topic.name,
            subject: SUBJECT_CODE_TO_NAME[topic.subject || ''] || topic.subject || 'Geral',
            knowledgeArea: AREA_CODE_TO_NAME[topic.knowledgeArea] || topic.knowledgeArea,
            total: 0,
            correct: 0,
          })
        }
        const stats = topicStats.get(key)!
        stats.total++
        if (answer.isCorrect) {
          stats.correct++
        }
      }
    }

    // Convert to TopicPerformance array with urgency levels
    const performance: TopicPerformance[] = Array.from(topicStats.values())
      .filter(s => s.total >= 1) // Only show topics with at least 1 answer
      .map(s => {
        const accuracyRate = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
        let urgencyLevel: UrgencyLevel
        if (accuracyRate < 40) urgencyLevel = 'CRITICAL'
        else if (accuracyRate < 60) urgencyLevel = 'HIGH'
        else if (accuracyRate < 80) urgencyLevel = 'MEDIUM'
        else urgencyLevel = 'LOW'

        return {
          topic: s.topic,
          subject: s.subject,
          knowledgeArea: s.knowledgeArea,
          total: s.total,
          correct: s.correct,
          accuracyRate,
          urgencyLevel,
        }
      })
      .sort((a, b) => a.accuracyRate - b.accuracyRate) // Worst performance first

    return { success: true, data: performance }
  } catch (error) {
    console.error('[getUserPerformanceByTopic] Unexpected error:', error)
    return { success: false, error: 'Erro ao carregar performance por tópico' }
  }
}

export interface PerformanceHistoryPoint {
  date: string // ISO date string (YYYY-MM-DD)
  week: string // Week label (e.g., "Sem 1", "Sem 2")
  total: number
  correct: number
  accuracyRate: number
}

/**
 * Get user performance history over time (by week)
 * Returns performance data aggregated by week for the last 12 weeks
 */
export async function getUserPerformanceHistory(userId: string): Promise<ActionResponse<PerformanceHistoryPoint[]>> {
  try {
    // Fetch all answered questions for this user with dates
    const { data: answers, error } = await supabase
      .from('SimuladoQuestao')
      .select(`
        isCorrect,
        answeredAt,
        Simulado!inner(userId)
      `)
      .eq('Simulado.userId', userId)
      .not('answeredAt', 'is', null)
      .order('answeredAt', { ascending: true })

    if (error) {
      console.error('[getUserPerformanceHistory] Error fetching answers:', error)
      return { success: false, error: 'Erro ao carregar histórico' }
    }

    if (!answers || answers.length === 0) {
      return { success: true, data: [] }
    }

    // Group by week
    const weekMap = new Map<string, { total: number; correct: number; date: Date }>()

    for (const answer of answers) {
      if (!answer.answeredAt) continue

      const date = new Date(answer.answeredAt)
      // Get the start of the week (Sunday)
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      const weekKey = startOfWeek.toISOString().split('T')[0]

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { total: 0, correct: 0, date: startOfWeek })
      }

      const stats = weekMap.get(weekKey)!
      stats.total++
      if (answer.isCorrect) {
        stats.correct++
      }
    }

    // Convert to array and calculate accuracy
    const weekArray = Array.from(weekMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0])) // Sort by date ascending
      .slice(-12) // Last 12 weeks

    const history: PerformanceHistoryPoint[] = weekArray.map(([dateKey, stats], index) => ({
      date: dateKey,
      week: `Sem ${index + 1}`,
      total: stats.total,
      correct: stats.correct,
      accuracyRate: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }))

    return { success: true, data: history }
  } catch (error) {
    console.error('[getUserPerformanceHistory] Unexpected error:', error)
    return { success: false, error: 'Erro ao carregar histórico de performance' }
  }
}
