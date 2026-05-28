import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'
import { getSupabaseConfig, isSupabaseConfigured } from '@/lib/supabase/config'

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  const config = getSupabaseConfig()

  return createBrowserClient<Database>(config.url, config.anonKey)
}
