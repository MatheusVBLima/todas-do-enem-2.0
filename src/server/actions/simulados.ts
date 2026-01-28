"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase/server"
import { PAGINATION } from "@/lib/constants"
import type { Json } from "@/lib/supabase/database.types"
import type {
  ActionResponse,
  CreateSimuladoParams,
  SubmitAnswerParams,
  Simulado,
  SimuladoWithQuestions,
  SimuladoWithResult,
  SimuladoResultado,
  PaginatedResponse,
  QuestionWithExam,
} from "@/types"

// Create a new simulado with questions based on current filters
export async function createSimulado(
  params: CreateSimuladoParams
): Promise<ActionResponse<Simulado>> {
  const { userId, name, filters, timeLimit, sourceType, sourceGroupId } = params

  try {
    let questions: any[] = []

    // If creating from a group, fetch group's questions
    if (sourceGroupId) {
      const { data: groupQuestions, error: groupError } = await supabase
        .from('QuestionsOnGroups')
        .select('questionId, question:Question(*)')
        .eq('groupId', sourceGroupId)
        .order('addedAt', { ascending: false })

      if (groupError) {
        console.error("Error fetching questions from group:", groupError)
        return { success: false, error: "Erro ao buscar questões do grupo." }
      }

      questions = (groupQuestions || []).map((gq: any) => gq.question)

      if (questions.length === 0) {
        return {
          success: false,
          error: "Este grupo não possui questões. Adicione questões ao grupo antes de criar um simulado.",
        }
      }
    } else {
      // Fetch questions from database using RPC search
      const { data: questionsData, error: questionsError } = await supabase.rpc(
        "search_questions_with_trigrams",
        {
          p_busca: filters.busca?.trim() || '',
          p_anos: filters.anos && filters.anos.length > 0 ? filters.anos : undefined,
          p_areas: filters.areas && filters.areas.length > 0 ? filters.areas : undefined,
          p_disciplinas: filters.disciplinas && filters.disciplinas.length > 0 ? filters.disciplinas : undefined,
          p_topics: filters.topics && filters.topics.length > 0 ? filters.topics : undefined,
          p_offset: 0,
          p_limit: 500, // Reasonable max for a simulado
        }
      )

      if (questionsError) {
        console.error("Error fetching questions for simulado:", questionsError)
        return { success: false, error: "Erro ao buscar questões para o simulado." }
      }

      questions = (questionsData as any[]) || []

      if (questions.length === 0) {
        return {
          success: false,
          error: "Nenhuma questão encontrada com os filtros selecionados.",
        }
      }
    }

    // Create the simulado record
    const { data: simulado, error: simuladoError } = await supabase
      .from("Simulado")
      .insert({
        userId,
        name,
        totalQuestions: questions.length,
        timeLimit: timeLimit || null,
        appliedFilters: filters as unknown as Json,
        sourceType,
        sourceGroupId: sourceGroupId || null,
        status: "EM_ANDAMENTO",
      })
      .select()
      .single()

    if (simuladoError) {
      console.error("Error creating simulado:", simuladoError)
      return { success: false, error: "Erro ao criar simulado." }
    }

    // Create SimuladoQuestao records for each question
    const simuladoQuestoes = questions.map((q: any, index: number) => ({
      simuladoId: simulado.id,
      questionId: q.id,
      position: index + 1,
    }))

    const { error: questoesError } = await supabase
      .from("SimuladoQuestao")
      .insert(simuladoQuestoes)

    if (questoesError) {
      console.error("Error creating simulado questions:", questoesError)
      // Rollback: delete the simulado
      await supabase.from("Simulado").delete().eq("id", simulado.id)
      return { success: false, error: "Erro ao adicionar questões ao simulado." }
    }

    revalidatePath("/simulados")

    return { success: true, data: simulado as Simulado }
  } catch (error) {
    console.error("Error in createSimulado:", error)
    return { success: false, error: "Erro inesperado ao criar simulado." }
  }
}

// Get simulado with all its questions for the session page
export async function getSimuladoSession(
  simuladoId: string
): Promise<ActionResponse<SimuladoWithQuestions>> {
  try {
    // Get simulado
    const { data: simulado, error: simuladoError } = await supabase
      .from("Simulado")
      .select("*")
      .eq("id", simuladoId)
      .single()

    if (simuladoError || !simulado) {
      return { success: false, error: "Simulado não encontrado." }
    }

    // Get simulado questions
    const { data: simuladoQuestoes, error: questoesError } = await supabase
      .from("SimuladoQuestao")
      .select("*")
      .eq("simuladoId", simuladoId)
      .order("position", { ascending: true })

    if (questoesError) {
      console.error("Error fetching simulado questions:", questoesError)
      return { success: false, error: "Erro ao carregar questões do simulado." }
    }

    // Fetch question details from Question table
    const { data: questoesWithDetails, error: detailsError } = await supabase
      .from("SimuladoQuestao")
      .select(`
        *,
        question:Question(
          *,
          exam:Exam(*)
        )
      `)
      .eq("simuladoId", simuladoId)
      .order("position", { ascending: true })

    if (detailsError) {
      console.error("Error fetching question details:", detailsError)
      return { success: false, error: "Erro ao carregar detalhes das questões." }
    }

    const result: SimuladoWithQuestions = {
      ...simulado,
      questions: questoesWithDetails.map((sq: any) => ({
        ...sq,
        question: sq.question as QuestionWithExam,
      })),
    }

    return { success: true, data: result }
  } catch (error) {
    console.error("Error in getSimuladoSession:", error)
    return { success: false, error: "Erro ao carregar simulado." }
  }
}

// Submit an answer for a question
export async function submitAnswer(
  params: SubmitAnswerParams
): Promise<ActionResponse<{ isCorrect: boolean }>> {
  const { simuladoId, questionId, answer } = params

  try {
    // Get the correct answer from database
    const { data: question, error: questionError } = await supabase
      .from("Question")
      .select("correctAnswer")
      .eq("id", questionId)
      .single()

    if (questionError || !question) {
      return { success: false, error: "Questão não encontrada." }
    }

    const correctAnswer = question.correctAnswer
    if (!correctAnswer) {
      return { success: false, error: "Questão não encontrada." }
    }

    // Questões anuladas ou com gabarito 'X' (placeholder) são sempre consideradas corretas
    const isCorrect = correctAnswer === 'ANULADA' || correctAnswer === 'X' || correctAnswer === answer

    // Update the SimuladoQuestao record
    const { error: updateError } = await supabase
      .from("SimuladoQuestao")
      .update({
        userAnswer: answer,
        isCorrect,
        answeredAt: new Date().toISOString(),
      })
      .eq("simuladoId", simuladoId)
      .eq("questionId", questionId)

    if (updateError) {
      console.error("Error updating answer:", updateError)
      return { success: false, error: "Erro ao salvar resposta." }
    }

    return { success: true, data: { isCorrect } }
  } catch (error) {
    console.error("Error in submitAnswer:", error)
    return { success: false, error: "Erro ao processar resposta." }
  }
}

// Finish simulado and calculate results
export async function finishSimulado(
  simuladoId: string,
  timeTaken?: number
): Promise<ActionResponse<SimuladoResultado>> {
  try {
    // Get simulado with questions
    const { data: simulado, error: simuladoError } = await supabase
      .from("Simulado")
      .select("*")
      .eq("id", simuladoId)
      .single()

    if (simuladoError || !simulado) {
      return { success: false, error: "Simulado não encontrado." }
    }

    // Get all answers with question details
    const { data: answers, error: answersError } = await supabase
      .from("SimuladoQuestao")
      .select(`
        *,
        question:Question(knowledgeArea)
      `)
      .eq("simuladoId", simuladoId)

    if (answersError) {
      return { success: false, error: "Erro ao calcular resultados." }
    }

    // Calculate scores
    let correctAnswers = 0
    let wrongAnswers = 0
    let unansweredQuestions = 0
    const scoreByArea: Record<string, { correct: number; total: number; percentage: number }> = {}

    for (const answer of answers) {
      const area = answer.question?.knowledgeArea || "Outros"

      if (!scoreByArea[area]) {
        scoreByArea[area] = { correct: 0, total: 0, percentage: 0 }
      }
      scoreByArea[area].total++

      if (answer.userAnswer === null) {
        unansweredQuestions++
      } else if (answer.isCorrect) {
        correctAnswers++
        scoreByArea[area].correct++
      } else {
        wrongAnswers++
      }
    }

    // Calculate percentages
    for (const area in scoreByArea) {
      scoreByArea[area].percentage =
        scoreByArea[area].total > 0
          ? Math.round((scoreByArea[area].correct / scoreByArea[area].total) * 100)
          : 0
    }

    const totalScore =
      answers.length > 0
        ? Math.round((correctAnswers / answers.length) * 100)
        : 0

    // Create result record
    const { data: resultado, error: resultadoError } = await supabase
      .from("SimuladoResultado")
      .insert({
        simuladoId,
        totalScore,
        correctAnswers,
        wrongAnswers,
        unansweredQuestions,
        scoreByArea,
        timeTaken: timeTaken || null,
      })
      .select()
      .single()

    if (resultadoError) {
      console.error("Error creating resultado:", resultadoError)
      return { success: false, error: "Erro ao salvar resultado." }
    }

    // Update simulado status
    await supabase
      .from("Simulado")
      .update({
        status: "CONCLUIDO",
        completedAt: new Date().toISOString(),
      })
      .eq("id", simuladoId)

    revalidatePath("/simulados")
    revalidatePath(`/simulados/${simuladoId}`)

    return { success: true, data: resultado as SimuladoResultado }
  } catch (error) {
    console.error("Error in finishSimulado:", error)
    return { success: false, error: "Erro ao finalizar simulado." }
  }
}

// Abandon simulado
export async function abandonSimulado(
  simuladoId: string
): Promise<ActionResponse> {
  try {
    const { error } = await supabase
      .from("Simulado")
      .update({
        status: "ABANDONADO",
        completedAt: new Date().toISOString(),
      })
      .eq("id", simuladoId)

    if (error) {
      return { success: false, error: "Erro ao abandonar simulado." }
    }

    revalidatePath("/simulados")
    return { success: true }
  } catch (error) {
    console.error("Error in abandonSimulado:", error)
    return { success: false, error: "Erro ao abandonar simulado." }
  }
}

// Delete simulado from history
export async function deleteSimulado(
  simuladoId: string
): Promise<ActionResponse> {
  try {
    // Delete related records first (cascade isn't automatic)
    // Delete resultado
    await supabase
      .from("SimuladoResultado")
      .delete()
      .eq("simuladoId", simuladoId)

    // Delete questoes
    await supabase
      .from("SimuladoQuestao")
      .delete()
      .eq("simuladoId", simuladoId)

    // Delete simulado
    const { error } = await supabase
      .from("Simulado")
      .delete()
      .eq("id", simuladoId)

    if (error) {
      console.error("Error deleting simulado:", error)
      return { success: false, error: "Erro ao deletar simulado." }
    }

    revalidatePath("/simulados")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteSimulado:", error)
    return { success: false, error: "Erro ao deletar simulado." }
  }
}

// Get simulados history for a user
export async function getSimulados(
  userId: string,
  page: number = 1,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<SimuladoWithResult>> {
  const offset = (page - 1) * pageSize

  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from("Simulado")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId)

    if (countError) {
      throw countError
    }

    // Get simulados with results
    const { data, error } = await supabase
      .from("Simulado")
      .select(`
        *,
        resultado:SimuladoResultado(*)
      `)
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      throw error
    }

    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)

    // Map the results - resultado comes as array, we need first item
    const simulados: SimuladoWithResult[] = (data || []).map((s: any) => ({
      ...s,
      resultado: Array.isArray(s.resultado) ? s.resultado[0] || null : s.resultado,
    }))

    return {
      data: simulados,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    }
  } catch (error) {
    console.error("Error in getSimulados:", error)
    return {
      data: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    }
  }
}

// Refazer simulado - create a new one with the same questions
export async function refazerSimulado(
  params: {
    userId: string
    name: string
    originalSimuladoId: string
    timeLimit?: number
  }
): Promise<ActionResponse<Simulado>> {
  const { userId, name, originalSimuladoId, timeLimit } = params

  try {
    // Get original simulado
    const { data: original, error: originalError } = await supabase
      .from("Simulado")
      .select("*")
      .eq("id", originalSimuladoId)
      .single()

    if (originalError || !original) {
      return { success: false, error: "Simulado original não encontrado." }
    }

    // Get original questions
    const { data: originalQuestions, error: questionsError } = await supabase
      .from("SimuladoQuestao")
      .select("questionId, position")
      .eq("simuladoId", originalSimuladoId)
      .order("position", { ascending: true })

    if (questionsError || !originalQuestions || originalQuestions.length === 0) {
      return { success: false, error: "Erro ao buscar questões do simulado original." }
    }

    // Create the new simulado record
    const { data: simulado, error: simuladoError } = await supabase
      .from("Simulado")
      .insert({
        userId,
        name,
        totalQuestions: originalQuestions.length,
        timeLimit: timeLimit || null,
        appliedFilters: original.appliedFilters,
        sourceType: "REFAZER",
        sourceGroupId: original.sourceGroupId,
        status: "EM_ANDAMENTO",
      })
      .select()
      .single()

    if (simuladoError) {
      console.error("Error creating simulado:", simuladoError)
      return { success: false, error: "Erro ao criar simulado." }
    }

    // Create SimuladoQuestao records for each question (same order)
    const simuladoQuestoes = originalQuestions.map((q) => ({
      simuladoId: simulado.id,
      questionId: q.questionId,
      position: q.position,
    }))

    const { error: questoesError } = await supabase
      .from("SimuladoQuestao")
      .insert(simuladoQuestoes)

    if (questoesError) {
      console.error("Error creating simulado questions:", questoesError)
      // Rollback: delete the simulado
      await supabase.from("Simulado").delete().eq("id", simulado.id)
      return { success: false, error: "Erro ao adicionar questões ao simulado." }
    }

    revalidatePath("/simulados")

    return { success: true, data: simulado as Simulado }
  } catch (error) {
    console.error("Error in refazerSimulado:", error)
    return { success: false, error: "Erro inesperado ao refazer simulado." }
  }
}

// Get a single simulado with result
export async function getSimuladoResult(
  simuladoId: string
): Promise<ActionResponse<SimuladoWithQuestions & { resultado: SimuladoResultado | null }>> {
  try {
    // Get simulado with result
    const { data: simulado, error: simuladoError } = await supabase
      .from("Simulado")
      .select(`
        *,
        resultado:SimuladoResultado(*)
      `)
      .eq("id", simuladoId)
      .single()

    if (simuladoError || !simulado) {
      return { success: false, error: "Simulado não encontrado." }
    }

    // Get questions with answers
    const { data: questions, error: questionsError } = await supabase
      .from("SimuladoQuestao")
      .select(`
        *,
        question:Question(
          *,
          exam:Exam(*)
        )
      `)
      .eq("simuladoId", simuladoId)
      .order("position", { ascending: true })

    if (questionsError) {
      return { success: false, error: "Erro ao carregar questões." }
    }

    const result = {
      ...simulado,
      resultado: Array.isArray(simulado.resultado)
        ? simulado.resultado[0] || null
        : simulado.resultado,
      questions: questions.map((sq: any) => ({
        ...sq,
        question: sq.question as QuestionWithExam,
      })),
    }

    return { success: true, data: result }
  } catch (error) {
    console.error("Error in getSimuladoResult:", error)
    return { success: false, error: "Erro ao carregar resultado." }
  }
}
