'use server'

import { cache } from 'react'
import { getSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResponse } from '@/types'
import type { User } from '@/lib/supabase/types'

/**
 * Get user by auth ID (internal, uncached)
 */
async function fetchUserProfile(authUserId: string): Promise<ActionResponse<User>> {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', authUserId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return { success: false, error: 'Erro ao buscar perfil do usuário' }
  }
}

/**
 * Get user by auth ID
 *
 * Uses React cache() to deduplicate calls within the same request.
 * Layout and Page can both call getUserProfile() without extra DB hits.
 */
export const getUserProfile = cache(fetchUserProfile)

/**
 * Update user profile (name only for now)
 */
export async function updateUserProfile(
  authUserId: string,
  data: { name: string }
): Promise<ActionResponse<User>> {
  try {
    const supabase = await getSupabaseServer()

    // Validate name
    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: 'Nome não pode estar vazio' }
    }

    if (data.name.trim().length > 100) {
      return { success: false, error: 'Nome muito longo (máximo 100 caracteres)' }
    }

    const { data: updatedUser, error } = await supabase
      .from('User')
      .update({
        name: data.name.trim(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', authUserId)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/conta')
    revalidatePath('/', 'layout') // Revalidate layout to update sidebar

    return { success: true, data: updatedUser }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { success: false, error: 'Erro ao atualizar perfil' }
  }
}

/**
 * Create or get user in database (called after Supabase Auth signup)
 */
export async function upsertUserInDatabase(
  authUserId: string,
  email: string
): Promise<ActionResponse<User>> {
  try {
    const supabase = await getSupabaseServer()

    // Try to get existing user first
    const { data: existingUser } = await supabase
      .from('User')
      .select('*')
      .eq('id', authUserId)
      .single()

    if (existingUser) {
      return { success: true, data: existingUser }
    }

    // Create new user with free plan
    const { data: newUser, error } = await supabase
      .from('User')
      .insert({
        id: authUserId,
        email,
        name: email.split('@')[0], // Default name from email
        plan: 'TENTANDO_A_SORTE', // Free plan
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data: newUser }
  } catch (error) {
    console.error('Error upserting user:', error)
    return { success: false, error: 'Erro ao criar usuário no banco de dados' }
  }
}
