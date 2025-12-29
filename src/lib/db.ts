/**
 * Database client
 * Re-exports Supabase server client for backwards compatibility
 */

export { supabase as db, getSupabaseServer } from './supabase/server'
export { getSupabaseClient } from './supabase/client'
