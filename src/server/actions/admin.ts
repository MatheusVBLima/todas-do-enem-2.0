"use server"

import { supabase } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/server"

// SECURITY: Only this email can access admin functions
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

if (!ADMIN_EMAIL) {
  throw new Error('ADMIN_EMAIL environment variable is not set')
}

export type TotalCosts = {
  totalCostBRL: number
  totalTokens: number
  totalRequests: number
  cacheHits: number
  cacheHitRate: number
}

export type UserCost = {
  userId: string
  userEmail: string
  userName: string
  totalCostBRL: number
  totalTokens: number
  totalRequests: number
  cacheHits: number
  lastUsed: string
}

async function verifyAdminAccess(): Promise<{ allowed: boolean; error?: string }> {
  const authUser = await getCurrentUser()

  if (!authUser) {
    return { allowed: false, error: 'Não autenticado' }
  }

  // Check if user's email matches the hardcoded admin email
  if (authUser.email !== ADMIN_EMAIL) {
    console.warn('[Admin] Unauthorized access attempt by:', authUser.email)
    return { allowed: false, error: 'Acesso negado: você não tem permissões de administrador' }
  }

  return { allowed: true }
}

export async function getTotalAICosts(): Promise<{ success: boolean; data?: TotalCosts; error?: string }> {
  // SECURITY: Verify admin access
  const accessCheck = await verifyAdminAccess()
  if (!accessCheck.allowed) {
    return { success: false, error: accessCheck.error }
  }

  try {
    const { data, error } = await supabase
      .rpc('get_total_ai_costs')
      .single()

    if (error) {
      console.error('[Admin] Error fetching total costs:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      console.error('[Admin] No data returned from get_total_ai_costs')
      return { success: false, error: 'Nenhum dado retornado' }
    }

    const totals = data as {
      totalCostBRL?: number
      totalTokens?: number
      totalRequests?: number
      cacheHits?: number
      cacheHitRate?: number
    }

    return {
      success: true,
      data: {
        totalCostBRL: totals.totalCostBRL ?? 0,
        totalTokens: totals.totalTokens ?? 0,
        totalRequests: totals.totalRequests ?? 0,
        cacheHits: totals.cacheHits ?? 0,
        cacheHitRate: totals.cacheHitRate ?? 0,
      }
    }
  } catch (error) {
    console.error('[Admin] Unexpected error:', error)
    return { success: false, error: 'Failed to fetch total costs' }
  }
}

export async function getCostsByUser(): Promise<{ success: boolean; data?: UserCost[]; error?: string }> {
  // SECURITY: Verify admin access
  const accessCheck = await verifyAdminAccess()
  if (!accessCheck.allowed) {
    return { success: false, error: accessCheck.error }
  }

  try {
    const { data, error } = await supabase.rpc('get_costs_by_user')

    if (error) {
      console.error('[Admin] Error fetching costs by user:', error)
      return { success: false, error: error.message }
    }

    const users: UserCost[] = (data || []).map((row: any) => ({
      userId: row.userId,
      userEmail: row.userEmail,
      userName: row.userName,
      totalCostBRL: parseFloat(row.totalCostBRL || '0'),
      totalTokens: parseInt(row.totalTokens || '0'),
      totalRequests: parseInt(row.totalRequests || '0'),
      cacheHits: parseInt(row.cacheHits || '0'),
      lastUsed: row.lastUsed,
    }))

    return { success: true, data: users }
  } catch (error) {
    console.error('[Admin] Unexpected error:', error)
    return { success: false, error: 'Failed to fetch costs by user' }
  }
}

export type UserDetails = UserCost & {
  plan: string
  createdAt: string
  stripeSubscriptionStatus: string | null
}

export async function getUserName(userId: string): Promise<{ success: boolean; data?: { name: string }; error?: string }> {
  // SECURITY: Verify admin access
  const accessCheck = await verifyAdminAccess()
  if (!accessCheck.allowed) {
    return { success: false, error: accessCheck.error }
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    return {
      success: true,
      data: { name: user.name || 'Usuário' }
    }
  } catch (error) {
    console.error('[Admin] Unexpected error:', error)
    return { success: false, error: 'Failed to fetch user name' }
  }
}

export async function getUserDetails(userId: string): Promise<{ success: boolean; data?: UserDetails; error?: string }> {
  // SECURITY: Verify admin access
  const accessCheck = await verifyAdminAccess()
  if (!accessCheck.allowed) {
    return { success: false, error: accessCheck.error }
  }

  try {
    // Get user basic info
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, email, name, plan, createdAt, stripeSubscriptionStatus')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('[Admin] Error fetching user:', userError)
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Get user AI costs
    const { data: costsData } = await supabase.rpc('get_costs_by_user')
    const userCosts = (costsData || []).find((row: any) => row.userId === userId)

    return {
      success: true,
      data: {
        userId: user.id,
        userEmail: user.email,
        userName: user.name || 'Usuário',
        plan: user.plan,
        createdAt: user.createdAt,
        stripeSubscriptionStatus: user.stripeSubscriptionStatus,
        totalCostBRL: parseFloat(String(userCosts?.totalCostBRL || '0')),
        totalTokens: parseInt(String(userCosts?.totalTokens || '0')),
        totalRequests: parseInt(String(userCosts?.totalRequests || '0')),
        cacheHits: parseInt(String(userCosts?.cacheHits || '0')),
        lastUsed: userCosts?.lastUsed || user.createdAt,
      }
    }
  } catch (error) {
    console.error('[Admin] Unexpected error:', error)
    return { success: false, error: 'Failed to fetch user details' }
  }
}
