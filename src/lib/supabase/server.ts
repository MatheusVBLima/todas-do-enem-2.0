/**
 * Supabase Server Client
 * For use in Server Components, Server Actions, and API Routes
 * Uses SERVICE_ROLE_KEY to bypass RLS
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
}

// Singleton pattern for serverless
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseServer() {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false, // Server doesn't need session persistence
        autoRefreshToken: false,
      },
    })
  }
  return supabaseInstance
}

// Export as default for convenience
export const supabase = getSupabaseServer()
