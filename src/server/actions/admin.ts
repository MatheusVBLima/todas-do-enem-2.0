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
      totalCostBRL?: string
      totalTokens?: string
      totalRequests?: string
      cacheHits?: string
      cacheHitRate?: string
    }

    return {
      success: true,
      data: {
        totalCostBRL: parseFloat(totals.totalCostBRL || '0'),
        totalTokens: parseInt(totals.totalTokens || '0'),
        totalRequests: parseInt(totals.totalRequests || '0'),
        cacheHits: parseInt(totals.cacheHits || '0'),
        cacheHitRate: parseFloat(totals.cacheHitRate || '0'),
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
