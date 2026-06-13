import { Database } from '@/lib/supabase/types'
import { ProductCard } from './ProductCard'

type Product = Database['public']['Tables']['products']['Row']

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No products found matching the criteria.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
