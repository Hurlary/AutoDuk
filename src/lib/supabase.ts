import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseEnabled = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url!, anonKey!)
  : null

/** snake_case row -> camelCase key mapping helper */
export function camelize<T = Record<string, unknown>>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v
  }
  return out as T
}
