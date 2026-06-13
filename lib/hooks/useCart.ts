'use client'

import { useCartStore, CartItem } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { createClient } from '../supabase/client'
import { useCallback } from 'react'
import { isSupabasePlaceholder } from '../supabase/mockDb'

export function useCart() {
  const supabase = createClient() as any
  const { user } = useAuthStore()
  const { items, addItem: storeAddItem, removeItem: storeRemoveItem, updateQuantity: storeUpdateQuantity, setItems, clearCart, setCoupon, coupon } = useCartStore()

  // Load cart items from database if logged in
  const fetchCart = useCallback(async () => {
    if (!user) return

    if (isSupabasePlaceholder()) {
      const allCartItems = JSON.parse(localStorage.getItem('devi_mock_cart_items') || '[]')
      const userCartItems = allCartItems.filter((item: any) => item.user_id === user.id)
      const allProducts = JSON.parse(localStorage.getItem('devi_mock_products') || '[]')

      const cartItems: CartItem[] = userCartItems.map((item: any) => {
        const prod = allProducts.find((p: any) => p.id === item.product_id)
        if (!prod) return null

        const variant = prod.product_variants?.find((v: any) => v.id === item.variant_id)
        const price = variant ? Number(variant.price) : Number(prod.price)
        const stock = variant ? Number(variant.stock_quantity) : Number(prod.stock_quantity)
        const variantName = variant ? variant.name : undefined
        const comparePrice = prod.compare_price ? Number(prod.compare_price) : null
        const imagesArray = Array.isArray(prod.images) ? prod.images : JSON.parse(prod.images || '[]')
        const image = imagesArray[0] || ''

        return {
          id: item.id,
          productId: item.product_id,
          variantId: item.variant_id,
          quantity: item.quantity,
          name: prod.name,
          slug: prod.slug,
          price,
          image,
          stock,
          variantName,
          comparePrice
        }
      }).filter((x: any): x is CartItem => x !== null)

      setItems(cartItems)
      return
    }

    const { data: dbItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        variant_id,
        products (
          name,
          slug,
          price,
          compare_price,
          images,
          stock_quantity
        ),
        product_variants (
          name,
          price,
          stock_quantity,
          sku
        )
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching cart:', error)
      return
    }

    const cartItems: CartItem[] = (dbItems || []).map((item: any) => {
      const prod = item.products
      const variant = item.product_variants
      const price = variant ? Number(variant.price) : Number(prod.price)
      const stock = variant ? Number(variant.stock_quantity) : Number(prod.stock_quantity)
      const variantName = variant ? variant.name : undefined
      const comparePrice = prod.compare_price ? Number(prod.compare_price) : null
      const imagesArray = Array.isArray(prod.images) ? prod.images : JSON.parse(prod.images || '[]')
      const image = imagesArray[0] || ''

      return {
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        name: prod.name,
        slug: prod.slug,
        price,
        image,
        stock,
        variantName,
        comparePrice
      }
    })

    setItems(cartItems)
  }, [user, supabase, setItems])

  // Sync guest cart to database upon login
  const mergeCart = useCallback(async () => {
    if (!user) return

    const currentItems = useCartStore.getState().items
    if (currentItems.length === 0) return

    if (isSupabasePlaceholder()) {
      const allCartItems = JSON.parse(localStorage.getItem('devi_mock_cart_items') || '[]')
      for (const item of currentItems) {
        const idx = allCartItems.findIndex((ci: any) => 
          ci.user_id === user.id && 
          ci.product_id === item.productId && 
          ci.variant_id === (item.variantId || null)
        )
        if (idx > -1) {
          allCartItems[idx].quantity = Math.min(allCartItems[idx].quantity + item.quantity, item.stock)
        } else {
          allCartItems.push({
            id: 'cart_' + Math.random().toString(36).substr(2, 9),
            user_id: user.id,
            product_id: item.productId,
            variant_id: item.variantId || null,
            quantity: item.quantity
          })
        }
      }
      localStorage.setItem('devi_mock_cart_items', JSON.stringify(allCartItems))
      await fetchCart()
      return
    }

    for (const item of currentItems) {
      let query = supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', item.productId)

      if (item.variantId) {
        query = query.eq('variant_id', item.variantId)
      } else {
        query = query.is('variant_id', null)
      }
      
      const matched = (await query).data as any[] | null

      if (matched && matched.length > 0) {
        const newQty = matched[0].quantity + item.quantity
        await supabase
          .from('cart_items')
          .update({ quantity: Math.min(newQty, item.stock) })
          .eq('id', matched[0].id)
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: item.productId,
            variant_id: item.variantId || null,
            quantity: item.quantity
          } as any)
      }
    }

    await fetchCart()
  }, [user, supabase, fetchCart])

  const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity ?? 1

    // Add to local state (optimistic)
    storeAddItem({ ...item, quantity: qty })

    if (user) {
      if (isSupabasePlaceholder()) {
        const allCartItems = JSON.parse(localStorage.getItem('devi_mock_cart_items') || '[]')
        const idx = allCartItems.findIndex((ci: any) => 
          ci.user_id === user.id && 
          ci.product_id === item.productId && 
          ci.variant_id === (item.variantId || null)
        )
        if (idx > -1) {
          allCartItems[idx].quantity = Math.min(allCartItems[idx].quantity + qty, item.stock)
        } else {
          allCartItems.push({
            id: 'cart_' + Math.random().toString(36).substr(2, 9),
            user_id: user.id,
            product_id: item.productId,
            variant_id: item.variantId || null,
            quantity: qty
          })
        }
        localStorage.setItem('devi_mock_cart_items', JSON.stringify(allCartItems))
        await fetchCart()
        return
      }

      let query = supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', item.productId)

      if (item.variantId) {
        query = query.eq('variant_id', item.variantId)
      } else {
        query = query.is('variant_id', null)
      }
      
      const data = (await query).data as any[] | null

      if (data && data.length > 0) {
        const newQty = data[0].quantity + qty
        await supabase
          .from('cart_items')
          .update({ quantity: Math.min(newQty, item.stock) })
          .eq('id', data[0].id)
      } else {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: item.productId,
            variant_id: item.variantId || null,
            quantity: qty
          } as any)
      }
      await fetchCart()
    }
  }

  const removeFromCart = async (id: string) => {
    storeRemoveItem(id)

    if (user) {
      if (isSupabasePlaceholder()) {
        let allCartItems = JSON.parse(localStorage.getItem('devi_mock_cart_items') || '[]')
        allCartItems = allCartItems.filter((ci: any) => ci.id !== id)
        localStorage.setItem('devi_mock_cart_items', JSON.stringify(allCartItems))
        await fetchCart()
        return
      }
      await supabase.from('cart_items').delete().eq('id', id)
      await fetchCart()
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    storeUpdateQuantity(id, quantity)

    if (user) {
      if (isSupabasePlaceholder()) {
        const allCartItems = JSON.parse(localStorage.getItem('devi_mock_cart_items') || '[]')
        const idx = allCartItems.findIndex((ci: any) => ci.id === id)
        if (idx > -1) {
          allCartItems[idx].quantity = quantity
          localStorage.setItem('devi_mock_cart_items', JSON.stringify(allCartItems))
        }
        await fetchCart()
        return
      }
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
      await fetchCart()
    }
  }

  return {
    items,
    coupon,
    setCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    fetchCart,
    mergeCart,
    clearCart
  }
}
