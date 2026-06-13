'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProductCard } from './ProductCard'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'

export function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: string
  currentProductId: string
}) {
  const [products, setProducts] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRelated() {
      const supabase = createClient()
      try {
        let data: any[] = []
        if (isSupabasePlaceholder()) {
          const allProducts = JSON.parse(localStorage.getItem('devi_mock_products') || '[]')
          data = allProducts.filter((p: any) => 
            p.category_id === categoryId && 
            p.is_active !== false && 
            p.id !== currentProductId
          ).slice(0, 4)
        } else {
          const res = await supabase
            .from('products')
            .select('*')
            .eq('category_id', categoryId)
            .eq('is_active', true)
            .neq('id', currentProductId)
            .limit(4)
          data = res.data || []
        }
        setProducts(data)
      } catch (err) {
        console.error('Error fetching related products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRelated()
  }, [categoryId, currentProductId])

  if (loading) return <LoadingSpinner className="py-4" />
  if (!products || products.length === 0) return null

  return (
    <div className="space-y-6 pt-12 border-t border-muted">
      <h3 className="text-xl font-extrabold tracking-tight uppercase">Related Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
