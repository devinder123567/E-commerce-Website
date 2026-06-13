import { createClient } from '@/lib/supabase/client'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'
import { useAuthStore } from '@/lib/store/authStore'

export async function updateProfile(profileData: { full_name?: string; phone?: string }) {
  if (isSupabasePlaceholder()) {
    const profiles = JSON.parse(localStorage.getItem('devi_mock_profiles') || '[]')
    const mockSessionStr = localStorage.getItem('devi-mock-session')
    if (mockSessionStr) {
      const session = JSON.parse(mockSessionStr)
      const uId = session.user.id
      const idx = profiles.findIndex((p: any) => p.id === uId)
      
      let updatedProfileObj: any
      if (idx > -1) {
        profiles[idx] = { ...profiles[idx], ...profileData }
        updatedProfileObj = profiles[idx]
      } else {
        updatedProfileObj = {
          id: uId,
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          role: 'customer',
          avatar_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        profiles.push(updatedProfileObj)
      }
      localStorage.setItem('devi_mock_profiles', JSON.stringify(profiles))
      
      // Also update the active session
      session.profile = { ...(session.profile || {}), ...profileData }
      localStorage.setItem('devi-mock-session', JSON.stringify(session))
      
      // Update authStore
      useAuthStore.getState().setAuth(session.user, session.profile)
      return { success: true }
    }
    throw new Error('User session not found')
  }

  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...profileData,
      updated_at: new Date().toISOString()
    })

  if (error) throw error

  // Refresh profile state in the client store
  const { data: updatedProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  useAuthStore.getState().setAuth(user, updatedProfile as any)
  return { success: true }
}
