"use server"

import { supabase } from "@/lib/supabase/server"
import { PAGINATION } from "@/lib/constants"
import type { QuestionFilters, PaginatedResponse, QuestionWithExam } from "@/types"

export async function getQuestions(
  filters: QuestionFilters
): Promise<PaginatedResponse<QuestionWithExam>> {
  const { anos, areas, disciplinas, busca, pagina = 1 } = filters
  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE
  const offset = (pagina - 1) * pageSize

  try {
    // Call RPC function for complex query with filters and ordering
    const { data, error } = await supabase.rpc('get_questions_with_filters', {
      p_anos: anos && anos.length > 0 ? anos : null,
      p_areas: areas && areas.length > 0 ? areas : null,
      p_disciplinas: disciplinas && disciplinas.length > 0 ? disciplinas : null,
      p_busca: busca?.trim() || null,
      p_offset: offset,
      p_limit: pageSize,
    })

    if (error) {
      console.error('Error fetching questions:', error)
      throw new Error('Failed to fetch questions')
    }

    // Extract questions and total count
    const questions = (data || []).map((row: any) => {
      const { total_count, ...question } = row
      return question as QuestionWithExam
    })

    const total = data?.[0]?.total_count || 0
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

export async function getQuestion(id: string) {
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

    return question
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

    // Return all years - they all have questions by design
    return (exams || []).map((e) => e.year)
  } catch (error) {
    console.error('Error in getYearsWithQuestions:', error)
    return []
  }
}
