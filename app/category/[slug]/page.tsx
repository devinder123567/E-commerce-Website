'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getProducts } from '@/actions/products'
import { ProductGrid } from '@/components/products/ProductGrid'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      try {
        let catData: any = null
        let prodData: any[] = []

        if (isSupabasePlaceholder()) {
          const cats = JSON.parse(localStorage.getItem('devi_mock_categories') || '[]')
          catData = cats.find((c: any) => c.slug === params.slug) || null
          if (catData) {
            const res = await getProducts({ categoryId: catData.id })
            prodData = res.data || []
          }
        } else {
          const { data } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', params.slug)
            .single()
          catData = data
          if (catData) {
            const res = await getProducts({ categoryId: catData.id })
            prodData = res.data || []
          }
        }

        if (catData) {
          setCategory(catData)
          setProducts(prodData)
        }
      } catch (err) {
        console.error('Error fetching category page data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.slug])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
        <h1 className="text-3xl font-extrabold">Category Not Found</h1>
        <p className="text-muted-foreground">The category you are looking for does not exist.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">{category.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {category.description || `Browse products in the ${category.name} category.`}
          </p>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  )
}
