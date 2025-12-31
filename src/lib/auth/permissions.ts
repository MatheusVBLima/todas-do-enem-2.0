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
 */
export function getQuotaLimits(plan: UserPlan | string): {
  questionsLimit: number
  essaysLimit: number
} {
  if (hasPaidPlan(plan)) {
    return {
      questionsLimit: 1500,
      essaysLimit: 20,
    }
  }

  return {
    questionsLimit: 0,
    essaysLimit: 0,
  }
}
