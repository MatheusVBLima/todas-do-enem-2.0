/**
 * AI Quota Management
 *
 * Server-side functions for managing AI usage quotas and tracking
 */

"use server"

import { supabase } from "@/lib/supabase/server"

export interface QuotaInfo {
  questionsUsed: number
  questionsLimit: number
  questionsRemaining: number
  essaysUsed: number
  essaysLimit: number
  essaysRemaining: number
  currentPeriodEnd: Date
  hasQuestionQuota: boolean
  hasEssayQuota: boolean
}

export interface QuotaCheckResult {
  allowed: boolean
  quota: QuotaInfo | null
  error?: string
}

/**
 * Get current quota info for user
 *
 * @param userId - User ID
 * @param userPlan - User plan (TENTANDO_A_SORTE | RUMO_A_APROVACAO)
 * @returns Current quota information or null on error
 */
export async function getUserQuota(userId: string, userPlan: string): Promise<QuotaInfo | null> {
  try {
    const { data, error } = await supabase
      .rpc('check_or_initialize_user_quota', {
        p_user_id: userId,
        p_user_plan: userPlan,
      })
      .single()

    if (error) {
      console.error('[getUserQuota] RPC error:', error)
      throw error
    }

    if (!data) {
      console.error('[getUserQuota] No data returned from RPC')
      return null
    }

    const quota = data as {
      questions_used: number
      questions_limit: number
      essays_used: number
      essays_limit: number
      current_period_end: string
    }

    return {
      questionsUsed: quota.questions_used,
      questionsLimit: quota.questions_limit,
      questionsRemaining: Math.max(0, quota.questions_limit - quota.questions_used),
      essaysUsed: quota.essays_used,
      essaysLimit: quota.essays_limit,
      essaysRemaining: Math.max(0, quota.essays_limit - quota.essays_used),
      currentPeriodEnd: new Date(quota.current_period_end),
      hasQuestionQuota: quota.questions_limit - quota.questions_used > 0,
      hasEssayQuota: quota.essays_limit - quota.essays_used > 0,
    }
  } catch (error) {
    console.error('[getUserQuota] Error:', error)
    return null
  }
}

/**
 * Check if user can generate question explanation
 *
 * @param userId - User ID
 * @param userPlan - User plan
 * @returns Check result with allowed flag and quota info
 */
export async function canGenerateExplanation(
  userId: string,
  userPlan: string
): Promise<QuotaCheckResult> {
  // Free plan users get no quota
  if (userPlan !== 'RUMO_A_APROVACAO') {
    return {
      allowed: false,
      quota: null,
      error: 'Este recurso é exclusivo do plano Rumo à Aprovação',
    }
  }

  const quota = await getUserQuota(userId, userPlan)

  if (!quota) {
    return {
      allowed: false,
      quota: null,
      error: 'Erro ao verificar quota de IA',
    }
  }

  if (!quota.hasQuestionQuota) {
    const renewalDate = quota.currentPeriodEnd.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
    })
    return {
      allowed: false,
      quota,
      error: `Você atingiu o limite de ${quota.questionsLimit} explicações por IA neste mês. Limite será renovado em ${renewalDate}.`,
    }
  }

  return {
    allowed: true,
    quota,
  }
}

/**
 * Check if user can correct essay
 *
 * @param userId - User ID
 * @param userPlan - User plan
 * @returns Check result with allowed flag and quota info
 */
export async function canCorrectEssay(
  userId: string,
  userPlan: string
): Promise<QuotaCheckResult> {
  // Free plan users get no quota
  if (userPlan !== 'RUMO_A_APROVACAO') {
    return {
      allowed: false,
      quota: null,
      error: 'Este recurso é exclusivo do plano Rumo à Aprovação',
    }
  }

  const quota = await getUserQuota(userId, userPlan)

  if (!quota) {
    return {
      allowed: false,
      quota: null,
      error: 'Erro ao verificar quota de IA',
    }
  }

  if (!quota.hasEssayQuota) {
    const renewalDate = quota.currentPeriodEnd.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
    })
    return {
      allowed: false,
      quota,
      error: `Você atingiu o limite de ${quota.essaysLimit} correções de redação neste mês. Limite será renovado em ${renewalDate}.`,
    }
  }

  return {
    allowed: true,
    quota,
  }
}

/**
 * Record AI usage and increment counter
 *
 * @param params - Usage parameters
 * @returns Success boolean
 */
export async function recordAIUsage(params: {
  userId: string
  type: 'QUESTION_EXPLANATION' | 'ESSAY_CORRECTION'
  resourceId: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCostBRL: number
  cacheHit: boolean
  status: 'SUCCESS' | 'ERROR' | 'QUOTA_EXCEEDED'
  errorMessage?: string
}): Promise<boolean> {
  try {
    // Log the usage event
    const { error: logError } = await supabase.rpc('log_ai_usage', {
      p_user_id: params.userId,
      p_type: params.type,
      p_resource_id: params.resourceId,
      p_prompt_tokens: params.promptTokens,
      p_completion_tokens: params.completionTokens,
      p_total_tokens: params.totalTokens,
      p_cost_brl: params.estimatedCostBRL,
      p_cache_hit: params.cacheHit,
      p_status: params.status,
      p_error_message: params.errorMessage || null,
    })

    if (logError) {
      console.error('[recordAIUsage] Log error:', logError)
      // Don't fail if logging fails - continue to increment
    }

    // Increment usage counter only if successful and not cached
    if (params.status === 'SUCCESS' && !params.cacheHit) {
      const { error: incrementError } = await supabase.rpc('increment_ai_usage', {
        p_user_id: params.userId,
        p_type: params.type,
        p_tokens: params.totalTokens,
        p_cost_brl: params.estimatedCostBRL,
      })

      if (incrementError) {
        console.error('[recordAIUsage] Increment error:', incrementError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('[recordAIUsage] Error:', error)
    return false
  }
}
