"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase/server"
import { correctEssay } from "./ai"
import type { ActionResponse } from "@/types"
import type { Essay, EssayCorrection } from "@/lib/supabase/types"

export type EssayWithCorrection = Essay & {
  correction: EssayCorrection | null
}

export type CreateEssayInput = {
  userId: string
  title: string
  theme: string
  content: string
}

export type UpdateEssayInput = {
  title?: string
  theme?: string
  content?: string
}

/**
 * Create a new essay (draft)
 */
export async function createEssay(
  input: CreateEssayInput
): Promise<ActionResponse<Essay>> {
  try {
    const wordCount = input.content.trim().split(/\s+/).filter(Boolean).length

    const { data: essay, error } = await supabase
      .from('Essay')
      .insert({
        userId: input.userId,
        title: input.title,
        theme: input.theme,
        content: input.content,
        wordCount,
        status: "DRAFT",
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/redacao")
    return { success: true, data: essay }
  } catch (error) {
    console.error("Error creating essay:", error)
    return { success: false, error: "Erro ao criar redação" }
  }
}

/**
 * Update an existing essay
 */
export async function updateEssay(
  id: string,
  input: UpdateEssayInput
): Promise<ActionResponse<Essay>> {
  try {
    const updateData: any = { ...input }

    // Recalculate word count if content changed
    if (input.content) {
      updateData.wordCount = input.content.trim().split(/\s+/).filter(Boolean).length
    }

    const { data: essay, error } = await supabase
      .from('Essay')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/redacao")
    revalidatePath(`/redacao/${id}`)
    return { success: true, data: essay }
  } catch (error) {
    console.error("Error updating essay:", error)
    return { success: false, error: "Erro ao atualizar redação" }
  }
}

/**
 * Submit essay for AI correction
 */
export async function submitEssay(
  id: string
): Promise<ActionResponse<Essay>> {
  try {
    // Call RPC function for atomic transaction
    const { data: result, error: rpcError } = await supabase
      .rpc('submit_essay_for_correction', { p_essay_id: id })

    if (rpcError) throw rpcError

    const resultObj = typeof result === 'string' ? JSON.parse(result) : result

    if (!resultObj.success) {
      return { success: false, error: resultObj.error }
    }

    // Get updated essay
    const { data: essay, error: fetchError } = await supabase
      .from('Essay')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Start AI correction in background (don't await)
    if (essay.theme && essay.content) {
      processEssayCorrection(id, essay.theme, essay.content).catch((error) => {
        console.error("Background correction error:", error)
      })
    }

    revalidatePath("/redacao")
    revalidatePath(`/redacao/${id}`)
    return { success: true, data: essay }
  } catch (error) {
    console.error("Error submitting essay:", error)
    return { success: false, error: "Erro ao enviar redação para correção" }
  }
}

/**
 * Process essay correction in background
 */
async function processEssayCorrection(
  essayId: string,
  theme: string,
  content: string
): Promise<void> {
  console.log(`[processEssayCorrection] Starting correction for essay ${essayId}`)

  let correctionData = null

  // Step 1: Get AI correction
  try {
    console.log(`[processEssayCorrection] Calling AI correction...`)
    const correctionResult = await correctEssay(theme, content)
    console.log(`[processEssayCorrection] AI correction completed:`, correctionResult.success)

    if (!correctionResult.success || !correctionResult.data) {
      console.log(`[processEssayCorrection] AI correction failed, creating error correction`)

      // Create error correction using RPC
      await supabase.rpc('save_essay_correction', {
        p_essay_id: essayId,
        p_comp1_score: 0,
        p_comp1_feedback: 'Erro ao processar correção.',
        p_comp2_score: 0,
        p_comp2_feedback: 'Erro ao processar correção.',
        p_comp3_score: 0,
        p_comp3_feedback: 'Erro ao processar correção.',
        p_comp4_score: 0,
        p_comp4_feedback: 'Erro ao processar correção.',
        p_comp5_score: 0,
        p_comp5_feedback: 'Erro ao processar correção.',
        p_total_score: 0,
        p_general_feedback: correctionResult.error || 'Ocorreu um erro ao processar a correção. Tente editar e reenviar a redação.',
      })

      return
    }

    correctionData = correctionResult.data
    console.log(`[processEssayCorrection] AI correction successful`)
  } catch (error) {
    console.error("[processEssayCorrection] AI correction error:", error)

    // Create error correction using RPC
    try {
      await supabase.rpc('save_essay_correction', {
        p_essay_id: essayId,
        p_comp1_score: 0,
        p_comp1_feedback: 'Erro ao processar correção.',
        p_comp2_score: 0,
        p_comp2_feedback: 'Erro ao processar correção.',
        p_comp3_score: 0,
        p_comp3_feedback: 'Erro ao processar correção.',
        p_comp4_score: 0,
        p_comp4_feedback: 'Erro ao processar correção.',
        p_comp5_score: 0,
        p_comp5_feedback: 'Erro ao processar correção.',
        p_total_score: 0,
        p_general_feedback: `Erro ao processar a correção: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente editar e reenviar a redação.`,
      })
    } catch (dbError) {
      console.error("[processEssayCorrection] Failed to save error correction:", dbError)
    }

    return
  }

  // Step 2: Save correction atomically using RPC
  try {
    console.log(`[processEssayCorrection] Saving correction...`)

    const { data: saveResult, error: saveError } = await supabase.rpc('save_essay_correction', {
      p_essay_id: essayId,
      p_comp1_score: correctionData.competencia1.pontuacao,
      p_comp1_feedback: correctionData.competencia1.feedback,
      p_comp2_score: correctionData.competencia2.pontuacao,
      p_comp2_feedback: correctionData.competencia2.feedback,
      p_comp3_score: correctionData.competencia3.pontuacao,
      p_comp3_feedback: correctionData.competencia3.feedback,
      p_comp4_score: correctionData.competencia4.pontuacao,
      p_comp4_feedback: correctionData.competencia4.feedback,
      p_comp5_score: correctionData.competencia5.pontuacao,
      p_comp5_feedback: correctionData.competencia5.feedback,
      p_total_score: correctionData.pontuacaoTotal,
      p_general_feedback: correctionData.feedbackGeral,
    })

    if (saveError) throw saveError

    console.log(`[processEssayCorrection] Correction saved successfully`)
  } catch (error) {
    console.error("[processEssayCorrection] Database error:", error)
    return
  }

  console.log(`[processEssayCorrection] Correction process completed successfully`)
}

/**
 * Get all essays for a user
 */
export async function getEssays(
  userId: string
): Promise<ActionResponse<EssayWithCorrection[]>> {
  try {
    const { data: essays, error } = await supabase
      .from('Essay')
      .select(`
        *,
        correction:EssayCorrection(*)
      `)
      .eq('userId', userId)
      .order('updatedAt', { ascending: false })

    if (error) throw error

    // Transform correction from array to single object
    const transformedEssays = (essays || []).map(essay => ({
      ...essay,
      correction: Array.isArray(essay.correction) && essay.correction.length > 0
        ? essay.correction[0]
        : null
    }))

    return { success: true, data: transformedEssays as EssayWithCorrection[] }
  } catch (error) {
    console.error("Error fetching essays:", error)
    return { success: false, error: "Erro ao buscar redações" }
  }
}

/**
 * Get a single essay by ID
 */
export async function getEssay(
  id: string
): Promise<ActionResponse<EssayWithCorrection>> {
  try {
    const { data: essay, error } = await supabase
      .from('Essay')
      .select(`
        *,
        correction:EssayCorrection(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!essay) {
      return { success: false, error: "Redação não encontrada" }
    }

    // When using .single(), Supabase returns correction as object (not array)
    // TypeScript types show it as array, but runtime it's an object
    return { success: true, data: essay as unknown as EssayWithCorrection }
  } catch (error) {
    console.error("[getEssay] Error fetching essay:", error)
    return { success: false, error: "Erro ao buscar redação" }
  }
}

/**
 * Delete an essay
 */
export async function deleteEssay(id: string): Promise<ActionResponse<void>> {
  try {
    // Cascade delete handles EssayCorrection automatically
    const { error } = await supabase
      .from('Essay')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath("/redacao")
    return { success: true }
  } catch (error) {
    console.error("Error deleting essay:", error)
    return { success: false, error: "Erro ao deletar redação" }
  }
}
