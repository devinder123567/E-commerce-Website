'use client'

import { useCartStore } from '@/lib/store/cartStore'
import { useCart } from '@/lib/hooks/useCart'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button, buttonVariants } from '@/components/ui/button'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Link } from 'wouter'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const { isDrawerOpen, setDrawerOpen } = useCartStore()
  const { items, removeFromCart, updateQuantity } = useCart()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col justify-between bg-background/95 backdrop-blur-md border-l border-muted">
        <SheetHeader className="pb-4 border-b border-muted">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Shopping Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
            <div className="p-4 bg-muted/30 rounded-full text-muted-foreground">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-semibold">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Button onClick={() => setDrawerOpen(false)} className="rounded-full px-6">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-muted/20 border border-muted/50 rounded-xl hover:bg-muted/40 transition-colors duration-150 relative overflow-hidden"
                >
                  <div className="relative w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-semibold text-sm leading-tight truncate">
                        {item.name}
                      </h4>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Variant: {item.variantName}
                        </p>
                      )}
                      <p className="text-sm font-bold text-primary mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-muted rounded-full overflow-hidden bg-background">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 px-2.5 hover:bg-muted text-muted-foreground transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-semibold px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 px-2.5 hover:bg-muted text-muted-foreground transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-muted pt-4 space-y-4 bg-background">
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Subtotal</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={() => setDrawerOpen(false)}
                  className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full')}
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setDrawerOpen(false)}
                  className={cn(buttonVariants(), 'rounded-full')}
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
