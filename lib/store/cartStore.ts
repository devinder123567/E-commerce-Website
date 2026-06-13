import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string // unique identifier: `${productId}-${variantId || 'default'}`
  productId: string
  variantId: string | null
  quantity: number
  name: string
  slug: string
  price: number
  image: string
  stock: number
  variantName?: string
  comparePrice?: number | null
}

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_amount: number
}

interface CartState {
  items: CartItem[]
  coupon: Coupon | null
  isDrawerOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  setItems: (items: CartItem[]) => void
  setCoupon: (coupon: Coupon | null) => void
  setDrawerOpen: (open: boolean) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      isDrawerOpen: false,
      addItem: (newItem) =>
        set((state) => {
          const qty = newItem.quantity ?? 1
          const existingIndex = state.items.findIndex((item) => item.id === newItem.id)
          if (existingIndex > -1) {
            const updatedItems = [...state.items]
            const currentQty = updatedItems[existingIndex].quantity
            updatedItems[existingIndex].quantity = Math.min(
              currentQty + qty,
              updatedItems[existingIndex].stock
            )
            return { items: updatedItems }
          }
          return { items: [...state.items, { ...newItem, quantity: qty }] }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item
          ),
        })),
      setItems: (items) => set({ items }),
      setCoupon: (coupon) => set({ coupon }),
      setDrawerOpen: (open) => set({ isDrawerOpen: open }),
      clearCart: () => set({ items: [], coupon: null }),
    }),
    {
      name: 'devi-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
