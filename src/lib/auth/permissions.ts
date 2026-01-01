/**
 * Permission helpers for feature access control
 */

type UserPlan = 'TENTANDO_A_SORTE' | 'RUMO_A_APROVACAO'

/**
 * Check if user has a paid plan
 */
export function hasPaidPlan(plan: UserPlan | string): boolean {
  return plan === 'RUMO_A_APROVACAO'
}

/**
 * Check if user can access AI explanations
 */
export function canAccessAIExplanations(plan: UserPlan | string): boolean {
  return hasPaidPlan(plan)
}

/**
 * Check if user can access essay correction
 */
export function canAccessEssayCorrection(plan: UserPlan | string): boolean {
  return hasPaidPlan(plan)
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(plan: UserPlan | string, route: string): boolean {
  // Essay routes require paid plan
  if (route.startsWith('/redacao')) {
    return hasPaidPlan(plan)
  }

  // All other routes are accessible
  return true
}

/**
 * Get quota limits for plan
 *
 * Updated 2026-01-01: Reduced questions limit from 1500 to 900
 * to optimize AI costs with Gemini 2.5 Flash migration
 *
 * 900/mês permite: ~5 ENEMs completos com 50% das questões explicadas
 * ou 4 ENEMs completos + uso durante a semana
 */
export function getQuotaLimits(plan: UserPlan | string): {
  questionsLimit: number
  essaysLimit: number
} {
  if (hasPaidPlan(plan)) {
    return {
      questionsLimit: 900,
      essaysLimit: 20,
    }
  }

  return {
    questionsLimit: 0,
    essaysLimit: 0,
  }
}
