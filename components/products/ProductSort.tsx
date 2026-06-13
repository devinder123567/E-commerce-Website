'use client'

import { useRouter, useSearchParams } from '@/lib/hooks/useViteNavigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ProductSort() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sortBy') || 'newest'

  const handleSortChange = (value: string | null) => {
    if (!value) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', value)
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Sort By</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[160px] bg-background/50 border-muted rounded-full">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">New Arrivals</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
          <SelectItem value="rating">Top Rated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
