'use client'

import { useEffect, useState } from 'react'
import { getOrderById } from '@/actions/orders'
import { buttonVariants } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { CheckCircle2 } from 'lucide-react'
import { Link } from 'wouter'
import { useSearchParams } from '@/lib/hooks/useViteNavigation'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false)
        return
      }
      try {
        const o = await getOrderById(orderId)
        setOrder(o)
      } catch (err) {
        console.error('Error fetching order:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-xl space-y-6 flex-grow flex flex-col justify-center">
      <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full w-20 h-20 mx-auto flex items-center justify-center animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tight">Order Confirmed!</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Thank you for your purchase! Your payment was processed successfully, and we have received your order.
      </p>

      {order && (
        <div className="p-6 border border-muted/50 bg-muted/10 rounded-2xl text-left space-y-4 text-xs">
          <div className="flex justify-between font-bold border-b border-muted pb-2 text-sm text-foreground">
            <span>Order ID</span>
            <span className="font-mono text-primary">#{order.id.slice(0, 8)}</span>
          </div>

          <div className="space-y-1 text-muted-foreground">
            <p className="font-bold text-foreground">Shipping To</p>
            <p>{(order.shipping_address as any).fullName}</p>
            <p>{(order.shipping_address as any).line1}, {(order.shipping_address as any).city}</p>
          </div>

          <div className="space-y-2 border-t border-muted pt-3">
            <p className="font-bold text-foreground">Summary</p>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(Number(order.subtotal))}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-primary font-semibold">
                <span>Discount Applied</span>
                <span>-{formatCurrency(Number(order.discount))}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span>{formatCurrency(Number(order.tax))}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{Number(order.shipping) === 0 ? 'Free' : formatCurrency(Number(order.shipping))}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-muted">
              <span>Total Paid</span>
              <span className="text-primary font-black">{formatCurrency(Number(order.total))}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "rounded-full font-bold px-8")}>
          Continue Shopping
        </Link>
        <Link href="/account/orders" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full font-bold px-8 border-muted")}>
          Track Orders
        </Link>
      </div>
    </div>
  )
}
