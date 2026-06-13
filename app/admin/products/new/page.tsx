'use client'

import { useEffect, useState } from 'react'
import { getCategories } from '@/actions/products'
import { ProductForm } from '@/components/admin/ProductForm'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function NewProductPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories()
        setCategories(cats || [])
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 flex-1">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Create Product</h1>
        <p className="text-sm text-muted-foreground">Add a new item to the public storefront catalog.</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}
