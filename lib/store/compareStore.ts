import { create } from 'zustand'

export interface CompareProduct {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  image: string
  description: string
  rating: number
  brand: string
  color: string
  size: string
}

interface CompareState {
  items: CompareProduct[]
  addItem: (product: CompareProduct) => void
  removeItem: (id: string) => void
  clear: () => void
}

export const useCompareStore = create<CompareState>((set) => ({
  items: [],
  addItem: (product) => set((state) => {
    if (state.items.find(item => item.id === product.id)) return state
    if (state.items.length >= 3) {
      alert('You can compare up to 3 products at a time.')
      return state
    }
    return { items: [...state.items, product] }
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  clear: () => set({ items: [] })
}))
