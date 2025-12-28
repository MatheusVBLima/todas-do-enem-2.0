"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { correctEssay } from "./ai"
import type { ActionResponse } from "@/types"
import type { Essay, EssayCorrection } from "@prisma/client"

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

    const essay = await db.essay.create({
      data: {
        userId: input.userId,
        title: input.title,
        theme: input.theme,
        content: input.content,
        wordCount,
        status: "DRAFT",
      },
    })

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

    const essay = await db.essay.update({
      where: { id },
      data: updateData,
    })

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
    // Get essay
    const essay = await db.essay.findUnique({
      where: { id },
      include: { correction: true },
    })

    if (!essay) {
      return { success: false, error: "Redação não encontrada" }
    }

    // Validate required fields
    if (!essay.theme) {
      return {
        success: false,
        error: "O tema da redação é obrigatório"
      }
    }

    // Check word count (minimum 200 words for ENEM)
    if (essay.wordCount < 200) {
      return {
        success: false,
        error: "A redação deve ter no mínimo 200 palavras para ser corrigida"
      }
    }

    // Delete old correction if exists and update status in a transaction
    const submittedEssay = await db.$transaction(async (tx) => {
      // Delete old correction if it exists
      if (essay.correction) {
        await tx.essayCorrection.delete({
          where: { essayId: id },
        })
      }

      // Update status to SUBMITTED
      return await tx.essay.update({
        where: { id },
        data: { status: "SUBMITTED" },
      })
    })

    // Start AI correction in background (don't await)
    processEssayCorrection(id, essay.theme, essay.content).catch((error) => {
      console.error("Background correction error:", error)
    })

    revalidatePath("/redacao")
    revalidatePath(`/redacao/${id}`)
    return { success: true, data: submittedEssay }
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
      console.log(`[processEssayCorrection] AI correction failed`)
      return
    }

    correctionData = correctionResult.data
    console.log(`[processEssayCorrection] AI correction successful`)
  } catch (error) {
    console.error("[processEssayCorrection] AI correction error:", error)
    return
  }

  // Step 2 & 3: Save correction and update status atomically using transaction
  try {
    console.log(`[processEssayCorrection] Saving correction and updating status in transaction...`)

    await db.$transaction(async (tx) => {
      // Save correction to database
      await tx.essayCorrection.create({
        data: {
          essayId,
          competence1Score: correctionData.competencia1.pontuacao,
          competence1Feedback: correctionData.competencia1.feedback,
          competence2Score: correctionData.competencia2.pontuacao,
          competence2Feedback: correctionData.competencia2.feedback,
          competence3Score: correctionData.competencia3.pontuacao,
          competence3Feedback: correctionData.competencia3.feedback,
          competence4Score: correctionData.competencia4.pontuacao,
          competence4Feedback: correctionData.competencia4.feedback,
          competence5Score: correctionData.competencia5.pontuacao,
          competence5Feedback: correctionData.competencia5.feedback,
          totalScore: correctionData.pontuacaoTotal,
          generalFeedback: correctionData.feedbackGeral,
        },
      })

      // Update essay status to CORRECTED
      await tx.essay.update({
        where: { id: essayId },
        data: { status: "CORRECTED" },
      })
    })

    console.log(`[processEssayCorrection] Transaction successful: correction saved and status updated to CORRECTED`)
  } catch (error) {
    console.error("[processEssayCorrection] Database transaction error:", error)
    // If transaction fails, just log the error (essay will stay as SUBMITTED)
    return
  }

  // Step 4: Revalidate paths (non-critical, don't fail if this errors)
  try {
    revalidatePath("/redacao")
    revalidatePath(`/redacao/${essayId}`)
    console.log(`[processEssayCorrection] Paths revalidated successfully`)
  } catch (error) {
    console.error("[processEssayCorrection] Revalidation error (non-critical):", error)
    // Don't fail the whole process for revalidation errors
  }
}

/**
 * Get all essays for a user
 */
export async function getEssays(
  userId: string
): Promise<ActionResponse<EssayWithCorrection[]>> {
  try {
    const essays = await db.essay.findMany({
      where: { userId },
      include: {
        correction: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return { success: true, data: essays }
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
    const essay = await db.essay.findUnique({
      where: { id },
      include: {
        correction: true,
      },
    })

    if (!essay) {
      return { success: false, error: "Redação não encontrada" }
    }

    return { success: true, data: essay }
  } catch (error) {
    console.error("Error fetching essay:", error)
    return { success: false, error: "Erro ao buscar redação" }
  }
}

/**
 * Delete an essay
 */
export async function deleteEssay(id: string): Promise<ActionResponse<void>> {
  try {
    // Delete correction first (if exists) due to foreign key
    await db.essayCorrection.deleteMany({
      where: { essayId: id },
    })

    // Delete essay
    await db.essay.delete({
      where: { id },
    })

    revalidatePath("/redacao")
    return { success: true }
  } catch (error) {
    console.error("Error deleting essay:", error)
    return { success: false, error: "Erro ao deletar redação" }
  }
}
