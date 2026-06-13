'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from '@/lib/hooks/useViteNavigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getCategories } from '@/actions/products'
import { LoadingSpinner } from '../shared/LoadingSpinner'

export function ProductFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  
  const activeCategoryId = searchParams.get('categoryId') || ''

  useEffect(() => {
    async function load() {
      const cats = await getCategories()
      setCategories(cats)
      setLoading(false)
    }
    load()
  }, [])

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice) params.set('minPrice', minPrice)
    else params.delete('minPrice')

    if (maxPrice) params.set('maxPrice', maxPrice)
    else params.delete('maxPrice')

    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const handleCategorySelect = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set('categoryId', id)
    else params.delete('categoryId')

    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setMinPrice('')
    maxPrice && setMaxPrice('')
    router.push('/products')
  }

  if (loading) return <LoadingSpinner className="py-8" />

  return (
    <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
      <CardContent className="p-5 space-y-6">
        <div>
          <h4 className="text-sm font-bold tracking-wide uppercase mb-3 text-foreground">Categories</h4>
          <div className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`w-full text-left py-1.5 px-3 rounded-full transition-colors duration-150 ${
                !activeCategoryId ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`w-full text-left py-1.5 px-3 rounded-full transition-colors duration-150 truncate ${
                  activeCategoryId === cat.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold tracking-wide uppercase mb-3 text-foreground">Price Range</h4>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border-muted rounded-full"
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border-muted rounded-full"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={applyFilters} size="sm" className="rounded-full flex-1">
              Apply
            </Button>
            <Button onClick={clearFilters} size="sm" variant="outline" className="rounded-full">
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
