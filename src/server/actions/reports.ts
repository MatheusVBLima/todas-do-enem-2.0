"use server"

import { supabase } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/server"
import type { ActionResponse, ReportedQuestion } from "@/types"

// SECURITY: Only this email can access admin functions
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

/**
 * Create a question report (requires authentication)
 */
export async function createQuestionReport(params: {
  questionId: string
  description?: string
}): Promise<ActionResponse> {
  try {
    const authUser = await getCurrentUser()

    if (!authUser) {
      return { success: false, error: 'Você precisa estar logado para reportar uma questão' }
    }

    const { questionId, description } = params

    // Check if user already reported this question
    const { data: existingReport } = await supabase
      .from('QuestionReport')
      .select('id')
      .eq('questionId', questionId)
      .eq('userId', authUser.id)
      .single()

    if (existingReport) {
      return { success: false, error: 'Você já reportou esta questão' }
    }

    // Create the report
    const { error } = await supabase
      .from('QuestionReport')
      .insert({
        questionId,
        userId: authUser.id,
        description: description || null,
      })

    if (error) {
      // Handle unique constraint violation (race condition)
      if (error.code === '23505') {
        return { success: false, error: 'Você já reportou esta questão' }
      }
      console.error('[createQuestionReport] Error:', error)
      return { success: false, error: 'Erro ao criar report' }
    }

    return { success: true }
  } catch (error) {
    console.error('[createQuestionReport] Unexpected error:', error)
    return { success: false, error: 'Erro inesperado ao reportar questão' }
  }
}

/**
 * Get all reported questions (admin only)
 */
export async function getReportedQuestions(): Promise<ActionResponse<ReportedQuestion[]>> {
  try {
    const authUser = await getCurrentUser()

    if (!authUser) {
      return { success: false, error: 'Não autenticado' }
    }

    // Check admin access
    if (authUser.email !== ADMIN_EMAIL) {
      console.warn('[getReportedQuestions] Unauthorized access attempt by:', authUser.email)
      return { success: false, error: 'Acesso negado: você não tem permissões de administrador' }
    }

    const { data, error } = await supabase.rpc('get_reported_questions')

    if (error) {
      console.error('[getReportedQuestions] Error:', error)
      return { success: false, error: error.message }
    }

    const reports: ReportedQuestion[] = (data || []).map((row: any) => ({
      questionId: row.questionId,
      questionNumber: row.questionNumber,
      examYear: row.examYear,
      knowledgeArea: row.knowledgeArea,
      reportCount: parseInt(String(row.reportCount || '0')),
    }))

    return { success: true, data: reports }
  } catch (error) {
    console.error('[getReportedQuestions] Unexpected error:', error)
    return { success: false, error: 'Erro ao buscar questões reportadas' }
  }
}
