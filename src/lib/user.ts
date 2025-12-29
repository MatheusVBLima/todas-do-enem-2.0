import { getCurrentUser as getSupabaseUser } from '@/lib/auth/server'

export type UserPlan = 'TENTANDO_A_SORTE' | 'RUMO_A_APROVACAO'

export interface AppUser {
  id: string
  email: string | undefined
  name: string
  plan: UserPlan
}

/**
 * Get the current authenticated user with app-specific data
 * Returns user data from Supabase Auth + User table
 */
export async function getCurrentUser(): Promise<AppUser> {
  const authUser = await getSupabaseUser()

  if (!authUser) {
    throw new Error('User not authenticated')
  }

  // For now, all new users get free plan
  // Later: fetch from User table in database
  return {
    id: authUser.id,
    email: authUser.email,
    name: authUser.email?.split('@')[0] || 'Usuário',
    plan: 'RUMO_A_APROVACAO', // TODO: Fetch from database
  }
}

/**
 * Check if user has paid plan
 */
export function hasPaidPlan(plan: UserPlan): boolean {
  return plan === 'RUMO_A_APROVACAO'
}

/**
 * Check if user can use AI features
 */
export function canUseAI(plan: UserPlan): boolean {
  return hasPaidPlan(plan)
}
