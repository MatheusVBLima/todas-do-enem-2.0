'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'

/**
 * Creates a Supabase client for Client Components
 * Automatically handles session management in the browser
 */
export function createClientSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
