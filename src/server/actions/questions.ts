"use server"

import { supabase } from "@/lib/supabase/server"
import { PAGINATION } from "@/lib/constants"
import type { QuestionFilters, PaginatedResponse, QuestionWithExam, QuestionFull } from "@/types"

export async function getQuestions(
  filters: QuestionFilters
): Promise<PaginatedResponse<QuestionWithExam>> {
  const { anos, areas, disciplinas, topics, busca, pagina = 1 } = filters
  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE
  const offset = (pagina - 1) * pageSize

  try {
    console.log('[Search] Starting search with filters:', {
      busca: filters.busca?.trim() || null,
      anos: filters.anos && filters.anos.length > 0 ? filters.anos : null,
      areas: filters.areas && filters.areas.length > 0 ? filters.areas : null,
      disciplinas: filters.disciplinas && filters.disciplinas.length > 0 ? filters.disciplinas : null,
      topics: filters.topics && filters.topics.length > 0 ? filters.topics : null,
      pagina: filters.pagina,
      offset,
    })

    const startTime = Date.now()

    // Call RPC function with trigram search for partial text matching
    const { data, error } = await supabase.rpc('search_questions_with_trigrams', {
      p_busca: busca?.trim() || '',
      p_anos: anos && anos.length > 0 ? anos : undefined,
      p_areas: areas && areas.length > 0 ? areas : undefined,
      p_disciplinas: disciplinas && disciplinas.length > 0 ? disciplinas : undefined,
      p_topics: topics && topics.length > 0 ? topics : undefined,
      p_offset: offset,
      p_limit: pageSize,
    })

    const duration = Date.now() - startTime
    const rows = (data as any[] | null) || []

    console.log('[Search] RPC Response:', {
      hasData: rows.length > 0,
      dataLength: rows.length,
      hasError: !!error,
      error: error,
      firstRow: rows[0] ? {
        id: rows[0].id,
        statement: rows[0].statement?.substring(0, 50),
        totalCount: rows[0].total_count
      } : null
    })

    if (error) {
      console.error('[Search] Error fetching questions:', error)
      console.error('[Search] Error details:', JSON.stringify(error, null, 2))
      throw new Error('Failed to fetch questions')
    }

    console.log('[Search] Query completed in', duration, 'ms')
    console.log('[Search] Results:', {
      found: rows.length || 0,
      totalCount: rows[0]?.total_count || 0,
    })

    // Extract questions and total count
    const questions = rows.map((row: any) => {
      const { total_count, ...question } = row
      return question as QuestionWithExam
    })

    const total = rows[0]?.total_count || 0
    const totalPages = Math.ceil(total / pageSize)

    return {
      data: questions,
      pagination: {
        page: pagina,
        pageSize,
        total,
        totalPages,
        hasMore: pagina < totalPages,
      },
    }
  } catch (error) {
    console.error('Error in getQuestions:', error)
    return {
      data: [],
      pagination: {
        page: pagina,
        pageSize,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    }
  }
}

export async function getQuestion(id: string): Promise<QuestionFull | null> {
  try {
    const { data: question, error } = await supabase
      .from('Question')
      .select(`
        *,
        exam:Exam(*),
        groups:QuestionsOnGroups(
          groupId,
          group:QuestionGroup(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching question:', error)
      return null
    }

    const normalizedQuestion = {
      ...question,
      exam: (question as any)?.exam && !(question as any)?.exam?.error ? (question as any).exam : null,
      groups: Array.isArray((question as any)?.groups) ? (question as any).groups : [],
    }

    return normalizedQuestion as QuestionFull
  } catch (error) {
    console.error('Error in getQuestion:', error)
    return null
  }
}

export async function getYearsWithQuestions(): Promise<number[]> {
  try {
    const { data: exams, error } = await supabase
      .from('Exam')
      .select('year')
      .order('year', { ascending: false })

    if (error) {
      console.error('Error fetching years:', error)
      return []
    }

    // Get unique years
    const years = [...new Set((exams || []).map((e) => e.year))]
    return years
  } catch (error) {
    console.error('Error in getYearsWithQuestions:', error)
    return []
  }
}

export interface TopicOption {
  name: string
  subject: string
  knowledgeArea: string
  questionCount: number
}

export async function getTopics(): Promise<TopicOption[]> {
  try {
    const { data, error } = await supabase
      .from('Topic')
      .select(`
        name,
        subject,
        knowledgeArea,
        QuestionTopic(count)
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching topics:', error)
      return []
    }

    return (data || []).map((t: any) => ({
      name: t.name,
      subject: t.subject,
      knowledgeArea: t.knowledgeArea,
      questionCount: t.QuestionTopic?.[0]?.count || 0,
    }))
  } catch (error) {
    console.error('Error in getTopics:', error)
    return []
  }
}
