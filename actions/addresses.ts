import { createClient } from '@/lib/supabase/client'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'

export interface Address {
  id: string
  full_name: string
  phone: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export async function getAddresses() {
  if (isSupabasePlaceholder()) {
    const list = localStorage.getItem('devi_mock_addresses')
    if (!list) {
      localStorage.setItem('devi_mock_addresses', JSON.stringify([]))
      return []
    }
    return JSON.parse(list) as Address[]
  }

  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })

  if (error) {
    console.error('Error fetching addresses:', error)
    return []
  }
  return (data || []) as any[]
}

export async function createAddress(addressData: Omit<Address, 'id'>) {
  if (isSupabasePlaceholder()) {
    const list = JSON.parse(localStorage.getItem('devi_mock_addresses') || '[]') as Address[]
    
    const isFirst = list.length === 0
    const setAsDefault = addressData.is_default || isFirst

    // If setting default, unset other defaults
    if (setAsDefault) {
      list.forEach(a => a.is_default = false)
    }

    const mockSessionStr = localStorage.getItem('devi-mock-session')
    let userId = 'u_guest'
    if (mockSessionStr) {
      userId = JSON.parse(mockSessionStr).user.id
    }

    const newAddress: Address = {
      ...addressData,
      is_default: setAsDefault,
      id: 'addr_' + Math.random().toString(36).substr(2, 9)
    }
    list.push(newAddress)
    localStorage.setItem('devi_mock_addresses', JSON.stringify(list))
    return newAddress
  }

  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // If this is set to default, reset others first
  if (addressData.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      ...addressData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAddress(id: string, addressData: Partial<Address>) {
  if (isSupabasePlaceholder()) {
    const list = JSON.parse(localStorage.getItem('devi_mock_addresses') || '[]') as Address[]
    const idx = list.findIndex(a => a.id === id)
    if (idx > -1) {
      if (addressData.is_default) {
        list.forEach(a => a.is_default = false)
      }
      list[idx] = { ...list[idx], ...addressData }
      localStorage.setItem('devi_mock_addresses', JSON.stringify(list))
      return { success: true }
    }
    throw new Error('Address not found')
  }

  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (addressData.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
  }

  const { error } = await supabase
    .from('addresses')
    .update(addressData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  return { success: true }
}

export async function deleteAddress(id: string) {
  if (isSupabasePlaceholder()) {
    let list = JSON.parse(localStorage.getItem('devi_mock_addresses') || '[]') as Address[]
    list = list.filter(a => a.id !== id)
    localStorage.setItem('devi_mock_addresses', JSON.stringify(list))
    return { success: true }
  }

  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  return { success: true }
}
