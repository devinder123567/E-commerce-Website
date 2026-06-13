'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../supabase/client'
import { useAuthStore } from '../store/authStore'
import { isSupabasePlaceholder } from '../supabase/mockDb'

export function useWishlist() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistProductIds([])
      return
    }
    setLoading(true)

    if (isSupabasePlaceholder()) {
      const list = JSON.parse(localStorage.getItem('devi_mock_wishlists') || '[]')
      const userWishlist = list.filter((w: any) => w.user_id === user.id)
      setWishlistProductIds(userWishlist.map((w: any) => w.product_id))
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id)

    setLoading(false)
    if (error) {
      console.error('Error fetching wishlist:', error)
      return
    }
    const wishlistsData = data as any[] | null
    setWishlistProductIds((wishlistsData || []).map((w) => w.product_id))
  }, [user, supabase])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const toggleWishlist = async (productId: string) => {
    if (!user) return false

    const isFav = wishlistProductIds.includes(productId)
    
    if (isSupabasePlaceholder()) {
      let list = JSON.parse(localStorage.getItem('devi_mock_wishlists') || '[]')
      if (isFav) {
        list = list.filter((w: any) => !(w.user_id === user.id && w.product_id === productId))
        setWishlistProductIds((prev) => prev.filter((id) => id !== productId))
      } else {
        list.push({ user_id: user.id, product_id: productId })
        setWishlistProductIds((prev) => [...prev, productId])
      }
      localStorage.setItem('devi_mock_wishlists', JSON.stringify(list))
      return true
    }

    // Optimistic Update
    if (isFav) {
      setWishlistProductIds((prev) => prev.filter((id) => id !== productId))
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
    } else {
      setWishlistProductIds((prev) => [...prev, productId])
      await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId
        } as any)
    }
    
    fetchWishlist()
    return true
  }

  const hasItem = (productId: string) => wishlistProductIds.includes(productId)

  return {
    wishlistProductIds,
    toggleWishlist,
    hasItem,
    loading,
    refresh: fetchWishlist
  }
}
