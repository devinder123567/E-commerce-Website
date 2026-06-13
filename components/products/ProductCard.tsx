'use client'

import { Database } from '@/lib/supabase/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart } from 'lucide-react'
import { Link } from 'wouter'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { cn } from '@/lib/utils'
import { useCompareStore } from '@/lib/store/compareStore'

import { motion } from 'framer-motion'

type Product = Database['public']['Tables']['products']['Row']

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const { toggleWishlist, hasItem } = useWishlist()

  const isFavorite = hasItem(product.id)
  const images = Array.isArray(product.images) ? product.images : JSON.parse((product.images as string) || '[]')
  const mainImage = images[0] || '/placeholder.png'

  const { items: compareItems, addItem: addToCompare, removeItem: removeFromCompare } = useCompareStore()
  const isCompared = compareItems.some(item => item.id === product.id)

  const handleCompareChange = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isCompared) {
      removeFromCompare(product.id)
    } else {
      const meta = (product.metadata as any) || {}
      addToCompare({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        compare_price: product.compare_price ? Number(product.compare_price) : null,
        image: mainImage,
        description: product.description || '',
        rating: 4.5,
        brand: meta.brand || 'Elite',
        color: meta.color || 'Standard',
        size: meta.size || 'One Size'
      })
    }
  }

  const discountPercent =
    product.compare_price && Number(product.compare_price) > Number(product.price)
      ? Math.round(
          ((Number(product.compare_price) - Number(product.price)) /
            Number(product.compare_price)) *
            100
        )
      : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: `${product.id}-default`,
      productId: product.id,
      variantId: null,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: mainImage,
      stock: product.stock_quantity,
      comparePrice: product.compare_price ? Number(product.compare_price) : null,
    })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="overflow-hidden border border-muted/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 rounded-2xl relative card-glow"
      >
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 p-2 bg-background/80 backdrop-blur-md hover:bg-background rounded-full border border-muted text-muted-foreground hover:text-rose-500 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
        </button>

        <button
          onClick={handleCompareChange}
          className={cn(
            "absolute z-10 flex items-center gap-1 px-2.5 py-1 bg-background/90 backdrop-blur-md hover:bg-background rounded-full border text-[9px] font-extrabold uppercase transition-all duration-200",
            discountPercent ? "top-[40px]" : "top-3",
            "left-3",
            isCompared ? "border-primary text-primary" : "border-muted text-muted-foreground"
          )}
        >
          <input
            type="checkbox"
            checked={isCompared}
            readOnly
            className="rounded border-muted text-primary focus:ring-primary h-3 w-3 pointer-events-none mr-1"
          />
          Compare
        </button>

        {discountPercent && (
          <span className="absolute top-3 left-3 z-10 bg-primary px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase text-primary-foreground rounded-full shadow-lg">
            {discountPercent}% OFF
          </span>
        )}

        <div className="relative aspect-square bg-muted overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              onClick={handleAddToCart}
              size="sm"
              disabled={product.stock_quantity === 0}
              className="rounded-full gap-2 px-5 font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            >
              <ShoppingCart size={16} />
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-foreground">
                {formatCurrency(Number(product.price))}
              </span>
              {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(Number(product.compare_price))}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-bold ${product.stock_quantity > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </CardContent>
      </motion.div>
    </Link>
  )
}
