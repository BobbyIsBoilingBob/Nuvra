import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
if (!url || !key) { console.warn('[supabase] Missing env vars — running in offline mode.') }
export const supabase = createClient(url ?? '', key ?? '', { auth: { persistSession: true, autoRefreshToken: true } })
export const isSupabaseConfigured = Boolean(url && key)
