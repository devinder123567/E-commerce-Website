'use client'

import { useState, useEffect } from 'react'
import { ProductImageGallery } from './ProductImageGallery'
import { ProductReviews } from './ProductReviews'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Heart, Minus, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { StarRating } from '../shared/StarRating'
import { getProductReviews } from '@/actions/reviews'
import { useRouter } from '@/lib/hooks/useViteNavigation'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProductDetailClient({ product }: { product: any }) {
  const { addToCart } = useCart()
  const { toggleWishlist, hasItem } = useWishlist()
  const router = useRouter()

  const variants = product.product_variants || []
  const [selectedVariant, setSelectedVariant] = useState<any>(variants.length > 0 ? variants[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'shipping'>('description')
  
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  const loadReviews = async () => {
    try {
      const data = await getProductReviews(product.id)
      setReviews(data || [])
    } catch (err) {
      console.error('Error loading reviews in product detail:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [product.id])

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0

  const isFavorite = hasItem(product.id)
  const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]')
  const mainImage = images[0] || '/placeholder.png'

  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price)
  const currentStock = selectedVariant ? Number(selectedVariant.stock_quantity) : Number(product.stock_quantity)
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku

  const handleAddToCart = () => {
    const itemKey = selectedVariant ? `${product.id}-${selectedVariant.id}` : `${product.id}-default`
    addToCart({
      id: itemKey,
      productId: product.id,
      variantId: selectedVariant ? selectedVariant.id : null,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      image: mainImage,
      stock: currentStock,
      variantName: selectedVariant ? selectedVariant.name : undefined,
      comparePrice: product.compare_price ? Number(product.compare_price) : null,
      quantity
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
      <ProductImageGallery images={images} />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-xs text-muted-foreground">SKU: {currentSku}</p>
            {reviews.length > 0 && (
              <>
                <span className="text-muted-foreground text-xs">•</span>
                <button
                  onClick={() => {
                    setActiveTab('reviews')
                    setTimeout(() => {
                      const el = document.getElementById('product-detail-tabs')
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }, 50)
                  }}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors text-xs font-bold text-muted-foreground bg-transparent border-none p-0 cursor-pointer"
                >
                  <StarRating rating={Math.round(averageRating)} size={12} />
                  <span className="underline decoration-dashed underline-offset-2">
                    {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-foreground">{formatCurrency(currentPrice)}</span>
          {product.compare_price && Number(product.compare_price) > currentPrice && (
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(Number(product.compare_price))}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

        {variants.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Choose Variant</span>
            <div className="flex flex-wrap gap-2">
              {variants.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVariant(v)
                    setQuantity(1)
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-full border transition-all duration-150 ${
                    selectedVariant?.id === v.id
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                      : 'border-muted hover:border-muted-foreground/30 bg-muted/20'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 border-t border-b border-muted py-4">
          <div className="flex items-center border border-muted rounded-full overflow-hidden bg-background">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-2 px-3.5 hover:bg-muted text-muted-foreground transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-semibold px-3">{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
              className="p-2 px-3.5 hover:bg-muted text-muted-foreground transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <span className={cn(
            "text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border",
            currentStock === 0 ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
            currentStock <= 5 ? "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse" :
            "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
          )}>
            {currentStock === 0 ? 'Out of stock' :
             currentStock <= 5 ? `Only ${currentStock} left in stock!` :
             'In Stock'}
          </span>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            size="lg"
            className="rounded-full flex-grow gap-2 font-bold uppercase text-xs tracking-wider"
          >
            <ShoppingBag size={18} /> Add to Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={currentStock === 0}
            size="lg"
            className="rounded-full bg-[#fb641b] hover:bg-[#e05310] text-white flex-grow gap-2 font-bold uppercase text-xs tracking-wider shadow-lg shadow-orange-500/15"
          >
            <Zap size={18} /> Buy Now
          </Button>
          <Button
            onClick={() => toggleWishlist(product.id)}
            variant="outline"
            size="lg"
            className="rounded-full p-3 border-muted hover:border-rose-500 hover:text-rose-500 transition-all duration-150"
          >
            <Heart size={18} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
          </Button>
        </div>

        <div id="product-detail-tabs" className="space-y-4 pt-6 border-t border-muted scroll-mt-20">
          <div className="flex border-b border-muted">
            {(['description', 'specifications', 'reviews', 'shipping'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 -mb-[2px] ${
                  activeTab === tab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="text-sm leading-relaxed min-h-[120px]">
            {activeTab === 'description' && (
              <p className="text-muted-foreground leading-relaxed">{product.description || 'No description provided.'}</p>
            )}
            {activeTab === 'specifications' && (
              <div className="border border-muted/50 rounded-2xl overflow-hidden bg-muted/5 max-w-xl">
                <table className="w-full border-collapse text-left text-xs">
                  <tbody className="divide-y divide-muted/30">
                    {Object.entries(product.metadata || {}).map(([key, value]) => {
                      if (key === 'specifications') return null
                      return (
                        <tr key={key} className="hover:bg-muted/5 transition-colors">
                          <td className="py-3 px-4 font-bold text-muted-foreground uppercase w-1/3">{key.replace(/_/g, ' ')}</td>
                          <td className="py-3 px-4 text-foreground font-semibold">{String(value)}</td>
                        </tr>
                      )
                    })}
                    {product.weight && (
                      <tr className="hover:bg-muted/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-muted-foreground uppercase w-1/3">Weight</td>
                        <td className="py-3 px-4 text-foreground font-semibold">{product.weight} kg</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'reviews' && (
              <ProductReviews
                productId={product.id}
                reviews={reviews}
                loading={reviewsLoading}
                onReviewAdded={loadReviews}
              />
            )}
            {activeTab === 'shipping' && (
              <p className="text-muted-foreground leading-relaxed">
                Free standard shipping on orders over $150. Delivery times typically range between 3 to 7 business days depending on location. Expedited options available during checkout.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
