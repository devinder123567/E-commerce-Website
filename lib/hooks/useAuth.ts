'use client'

import { useEffect } from 'react'
import { createClient } from '../supabase/client'
import { useAuthStore } from '../store/authStore'
import { isSupabasePlaceholder } from '../supabase/mockDb'

const supabase = createClient()

const getOrCreateProfile = async (session: any) => {
  try {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (data) {
      return data
    }

    // Profile doesn't exist, try to create it
    const fallbackProfile = {
      id: session.user.id,
      full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Customer',
      phone: session.user.phone || '',
      role: 'customer',
      avatar_url: '',
      created_at: new Date().toISOString()
    }

    const { data: inserted, error: insertError } = await (supabase as any)
      .from('profiles')
      .insert(fallbackProfile)
      .select()
      .single()

    if (!insertError && inserted) {
      return inserted
    }

    return fallbackProfile
  } catch (err) {
    console.error('Error in getOrCreateProfile:', err)
    return {
      id: session.user.id,
      full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Customer',
      phone: session.user.phone || '',
      role: 'customer',
      avatar_url: '',
      created_at: new Date().toISOString()
    }
  }
}

export function useAuth() {
  const { user, profile, loading, setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    let isMounted = true

    const bootstrapAuth = async () => {
      try {
        const mockSessionStr = localStorage.getItem('devi-mock-session')
        if (mockSessionStr) {
          const { user, profile } = JSON.parse(mockSessionStr)
          if (isMounted) {
            setAuth(user, profile)
          }
          return
        }

        if (isSupabasePlaceholder()) {
          if (isMounted) clearAuth()
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          if (isMounted) clearAuth()
          return
        }

        const profileData = await getOrCreateProfile(session)

        if (isMounted) {
          setAuth(session.user, profileData)
        }
      } catch (error) {
        console.error('Error fetching auth session:', error)
        if (isMounted) clearAuth()
      }
    }

    bootstrapAuth()

    if (isSupabasePlaceholder()) {
      return () => {
        isMounted = false
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const profileData = await getOrCreateProfile(session)
        if (isMounted) {
          setAuth(session.user, profileData)
        }
      } else {
        if (isMounted) {
          clearAuth()
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [setAuth, clearAuth])

  return { user, profile, loading }
}
