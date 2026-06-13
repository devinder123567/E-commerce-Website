'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from '@/lib/hooks/useViteNavigation'
import { getProducts, seedStoreDatabase } from '@/actions/products'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductHorizontalFilters } from '@/components/products/ProductHorizontalFilters'
import { CategoryNavRow } from '@/components/layout/CategoryNavRow'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Database, X } from 'lucide-react'
import { useCompareStore } from '@/lib/store/compareStore'
import { formatCurrency } from '@/lib/utils/formatCurrency'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Comparison modal states
  const { items: compareItems, removeItem: removeFromCompare, clear: clearCompare } = useCompareStore()
  const [showCompareModal, setShowCompareModal] = useState(false)

  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
  const categoryId = searchParams.get('categoryId') || undefined
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
  const sortBy = (searchParams.get('sortBy') || undefined) as any
  const search = searchParams.get('q') || undefined
  const brand = searchParams.get('brand') || undefined
  const color = searchParams.get('color') || undefined
  const size = searchParams.get('size') || undefined
  const rating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      try {
        const { data, count: totalCount, totalPages: pages } = await getProducts({
          categoryId,
          minPrice,
          maxPrice,
          sortBy,
          page,
          limit: 12,
          search,
          brand,
          color,
          size,
          rating
        })
        setProducts(data || [])
        setCount(totalCount || 0)
        setTotalPages(pages || 1)
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [categoryId, minPrice, maxPrice, sortBy, page, search, brand, color, size, rating])

  return (
    <div className="flex flex-col flex-1">
      <CategoryNavRow />
      
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black tracking-tight uppercase">Shop Catalog</h1>
            <p className="text-sm text-muted-foreground">
              {search ? `Search results for "${search}"` : 'Browse our premium catalog of tech devices and street apparel.'}
            </p>
          </div>

          <ProductHorizontalFilters />

          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {loading ? 'Searching...' : `${count} items found`}
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <LoadingSpinner />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-3xl border border-muted/50 bg-background/30 backdrop-blur-md space-y-6 max-w-2xl mx-auto my-8">
              <div className="p-5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                <Database size={44} className="animate-pulse text-primary" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-extrabold uppercase tracking-wide text-foreground">Catalog is empty</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No products could be loaded. Click below to automatically seed the database with all 6 categories, 12 default products, and sample variants.
                </p>
              </div>
              <Button
                onClick={async () => {
                  setLoading(true)
                  try {
                    await seedStoreDatabase()
                    alert('Demo database seeded successfully!')
                    window.location.reload()
                  } catch (err: any) {
                    alert(`Failed to seed database: ${err.message}`)
                  } finally {
                    setLoading(false)
                  }
                }}
                className="rounded-full px-8 font-bold text-xs uppercase tracking-wider gap-2 shadow-lg shadow-primary/20"
              >
                Seed Demo Database
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <ProductGrid products={products} />
              <Pagination currentPage={page} totalPages={totalPages || 1} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Bar */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-muted/80 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-row items-center justify-between gap-4 max-w-4xl mx-auto md:rounded-t-3xl animate-slide-up">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground hidden sm:block">Compare ({compareItems.length}/3)</span>
            <div className="flex gap-2">
              {compareItems.map(item => (
                <div key={item.id} className="relative w-12 h-12 border border-muted bg-muted/20 rounded-xl overflow-hidden group">
                  <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  <button
                    onClick={() => removeFromCompare(item.id)}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600 transition-colors shadow border border-background"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2.5">
            <Button
              onClick={() => setShowCompareModal(true)}
              disabled={compareItems.length < 2}
              className="rounded-full px-6 text-xs font-bold uppercase tracking-wider h-10 shadow-lg shadow-primary/20"
            >
              Compare Now
            </Button>
            <Button
              variant="outline"
              onClick={clearCompare}
              className="rounded-full px-5 text-xs font-bold uppercase tracking-wider h-10 border-muted text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-background border border-muted/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="h-14 border-b border-muted/50 flex items-center justify-between px-6 bg-muted/5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Product Comparison</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCompareModal(false)}
                className="rounded-full text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="flex-1 overflow-x-auto overflow-y-auto p-6 scrollbar-none">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-muted/50">
                    <th className="py-4 font-bold text-muted-foreground uppercase tracking-wider w-1/4">Specification</th>
                    {compareItems.map(item => (
                      <th key={item.id} className="py-4 px-4 w-1/4 align-top">
                        <div className="space-y-2.5">
                          <div className="w-24 h-24 border border-muted bg-muted/20 rounded-2xl overflow-hidden mx-auto">
                            <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                          </div>
                          <p className="font-extrabold text-foreground text-center line-clamp-2 min-h-[32px]">{item.name}</p>
                          <p className="text-center font-black text-primary text-sm">{formatCurrency(item.price)}</p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  <tr>
                    <td className="py-3 font-bold text-muted-foreground uppercase tracking-wide">Brand</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="py-3 px-4 text-center font-semibold text-foreground">{item.brand}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-muted-foreground uppercase tracking-wide">Color</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="py-3 px-4 text-center font-semibold text-foreground">{item.color}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-muted-foreground uppercase tracking-wide">Size</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="py-3 px-4 text-center font-semibold text-foreground">{item.size}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-muted-foreground uppercase tracking-wide">Rating</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="py-3 px-4 text-center font-semibold text-foreground">{item.rating}★</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-muted-foreground uppercase tracking-wide">Description</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="py-3 px-4 text-left leading-relaxed text-muted-foreground align-top min-w-[150px]">
                        <p className="line-clamp-4">{item.description}</p>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
