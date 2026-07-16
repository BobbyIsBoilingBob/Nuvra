import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  initialize: () => Promise<void>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (error) {
          console.error('Failed to load profile:', error)
        }

        set({ session, user: session.user, profile, loading: false })
      } else {
        set({ session: null, user: null, profile: null, loading: false })
      }
    } catch (err) {
      console.error('Auth init error:', err)
      set({ session: null, user: null, profile: null, loading: false })
    }

    supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      ;(async () => {
        if (event === 'SIGNED_OUT' || !session) {
          set({ session: null, user: null, profile: null })
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            let profile = get().profile
            if (!profile || profile.id !== session.user.id) {
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle()

              if (!error && data) {
                profile = data
              }
            }
            set({ session, user: session.user, profile })
          }
        }
      })()
    })
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        const msg = error.message
        if (msg.includes('already') || msg.includes('registered')) {
          set({ loading: false, error: 'An account with this email already exists.' })
          return { error: 'An account with this email already exists.' }
        }
        set({ loading: false, error: msg })
        return { error: msg }
      }

      if (data.session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Profile load error after signup:', profileError)
        }

        set({ session: data.session, user: data.session.user, profile, loading: false })
      } else {
        set({ loading: false })
      }

      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      set({ loading: false, error: msg })
      return { error: msg }
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        const msg = error.message
        if (msg.includes('Invalid login') || msg.includes('invalid')) {
          set({ loading: false, error: 'Incorrect email or password. Please try again.' })
          return { error: 'Incorrect email or password. Please try again.' }
        }
        set({ loading: false, error: msg })
        return { error: msg }
      }

      if (data.session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Profile load error after signin:', profileError)
        }

        set({ session: data.session, user: data.session.user, profile, loading: false })
      } else {
        set({ loading: false })
      }

      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      set({ loading: false, error: msg })
      return { error: msg }
    }
  },

  signOut: async () => {
    set({ loading: true })
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null, loading: false, error: null })
  },

  refreshProfile: async () => {
    const userId = get().user?.id
    if (!userId) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!error && data) {
      set({ profile: data })
    }
  },

  clearError: () => set({ error: null }),
}))
