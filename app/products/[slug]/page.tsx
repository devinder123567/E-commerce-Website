'use client'

import { useEffect, useState } from 'react'
import { getProductBySlug } from '@/actions/products'
import { ProductDetailClient } from '@/components/products/ProductDetailClient'
import { RelatedProducts } from '@/components/products/RelatedProducts'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProduct() {
      try {
        const prod = await getProductBySlug(params.slug)
        setProduct(prod)
      } catch (err) {
        console.error('Error loading product by slug:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [params.slug])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
        <h1 className="text-3xl font-extrabold">Product Not Found</h1>
        <p className="text-muted-foreground">The product you are looking for does not exist in our catalog.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 flex-1">
      <ProductDetailClient product={product} />

      {product.category_id && (
        <RelatedProducts categoryId={product.category_id} currentProductId={product.id} />
      )}
    </div>
  )
}
