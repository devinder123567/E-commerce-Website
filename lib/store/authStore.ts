import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { Database } from '../supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  setAuth: (user: User | null, profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setAuth: (user, profile) => set({ user, profile, loading: false }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ user: null, profile: null, loading: false }),
}))
