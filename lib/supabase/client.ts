import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

export const createClient = () => {
  const env = (import.meta as any).env || {}
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
