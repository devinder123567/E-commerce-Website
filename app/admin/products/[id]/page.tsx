'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'
import { getCategories } from '@/actions/products'
import { ProductForm } from '@/components/admin/ProductForm'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      try {
        let productData: any = null
        if (isSupabasePlaceholder()) {
          const allProducts = JSON.parse(localStorage.getItem('devi_mock_products') || '[]')
          productData = allProducts.find((p: any) => p.id === params.id) || null
        } else {
          const productRes = await supabase
            .from('products')
            .select(`
              *,
              product_variants (
                id,
                name,
                price,
                stock_quantity,
                sku
              )
            `)
            .eq('id', params.id)
            .single()
          productData = productRes.data || null
        }

        const categoriesRes = await getCategories()

        if (productData) {
          setProduct(productData)
        }
        setCategories(categoriesRes || [])
      } catch (err) {
        console.error('Error fetching edit product data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-12 text-center space-y-4">
        <h1 className="text-3xl font-extrabold">Product Not Found</h1>
        <p className="text-muted-foreground">The product you are trying to edit does not exist.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 flex-grow">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Edit Product</h1>
        <p className="text-sm text-muted-foreground">Modify details for &quot;{product.name}&quot;.</p>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  )
}
