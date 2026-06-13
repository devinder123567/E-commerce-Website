'use client'

import { useCart } from '@/lib/hooks/useCart'
import { Button, buttonVariants } from '@/components/ui/button'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'wouter'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { useState } from 'react'
import { validateCoupon } from '@/actions/coupons'
import { cn } from '@/lib/utils'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, coupon, setCoupon } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 150 ? 0 : 15
  const tax = subtotal * 0.08

  let discount = 0
  if (coupon) {
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100
    } else {
      discount = coupon.value
    }
    discount = Math.min(discount, subtotal)
  }

  const total = subtotal + tax + shipping - discount

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError('')
    setCouponSuccess('')

    if (!couponCode.trim()) return

    const result = await validateCoupon(couponCode.trim(), subtotal)
    if (result.success && result.coupon) {
      setCoupon({
        id: result.coupon.id,
        code: result.coupon.code,
        type: result.coupon.type,
        value: result.coupon.value,
        min_order_amount: result.coupon.min_order_amount
      })
      setCouponSuccess(`Coupon code applied successfully! Saved ${formatCurrency(result.discountAmount || 0)}`)
      setCouponCode('')
    } else {
      setCouponError(result.message || 'Invalid coupon code')
    }
  }

  const handleRemoveCoupon = () => {
    setCoupon(null)
    setCouponSuccess('')
    setCouponError('')
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md space-y-6 flex-1 flex flex-col justify-center">
        <div className="p-6 bg-muted/20 border border-muted/50 rounded-full w-24 h-24 mx-auto flex items-center justify-center text-muted-foreground animate-bounce">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Your Cart is Empty</h1>
        <p className="text-sm text-muted-foreground">
          Looks like you haven&apos;t added any items to your shopping cart yet. Start exploring our premium catalog.
        </p>
        <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 font-bold mx-auto")}>
          Browse Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/20 border border-muted/50 rounded-2xl hover:bg-muted/30 transition-colors duration-150 relative overflow-hidden"
            >
              <div className="relative w-24 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                <img
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between text-center sm:text-left min-w-0">
                <div className="space-y-1">
                  <h3 className="font-bold text-base truncate">{item.name}</h3>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">Variant: {item.variantName}</p>
                  )}
                  <p className="text-sm font-extrabold text-primary">{formatCurrency(item.price)}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 mt-4 sm:mt-0">
                  <div className="flex items-center border border-muted rounded-full overflow-hidden bg-background">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 px-3 hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-semibold px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 px-3 hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive px-3 py-1.5 hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="p-5 border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Discount Coupon</h3>
            {coupon ? (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-3 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-primary font-mono">{coupon.code}</p>
                  <p className="text-[10px] text-muted-foreground">Applied successfully</p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-background border border-muted px-4 py-2 text-xs rounded-full focus:outline-none focus:border-primary uppercase font-mono"
                />
                <Button type="submit" size="sm" className="rounded-full px-5">
                  Apply
                </Button>
              </form>
            )}

            {couponError && <p className="text-xs text-rose-500 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-emerald-500 font-medium">{couponSuccess}</p>}
          </div>

          <div className="p-5 border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Order Summary</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Tax (8%)</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? <span className="text-emerald-500 font-bold uppercase tracking-wider">Free</span> : formatCurrency(shipping)}
                </span>
              </div>
              {coupon && (
                <div className="flex justify-between text-primary font-bold">
                  <span>Coupon Discount ({coupon.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t border-muted pt-3 flex justify-between text-sm font-bold text-foreground">
                <span>Estimated Total</span>
                <span className="text-base text-primary font-black">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "w-full rounded-full gap-2 font-bold text-xs uppercase tracking-wider mt-2")}>
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
