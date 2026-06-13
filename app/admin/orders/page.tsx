'use client'

import { useEffect, useState } from 'react'
import { getAdminOrders } from '@/actions/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatDate } from '@/lib/utils/formatDate'
import { OrderStatusSelector } from '@/components/admin/OrderStatusSelector'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getAdminOrders()
        setOrders(data || [])
      } catch (err) {
        console.error('Error fetching admin orders:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 flex-grow">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Fulfill Orders</h1>
        <p className="text-sm text-muted-foreground">Manage shipping pipelines, track card receipts, and update order statuses.</p>
      </div>

      <div className="border border-muted/50 rounded-2xl bg-background/50 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-muted hover:bg-transparent">
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Order ID</TableHead>
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Customer</TableHead>
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Total</TableHead>
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Payment</TableHead>
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Fulfillment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground text-xs py-8">
                  No orders found in the queue. Complete checkouts to populate the list.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id} className="border-muted/55 hover:bg-muted/10 transition-colors">
                  <TableCell className="text-xs font-mono font-bold text-primary">#{order.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-xs">{formatDate(order.created_at)}</TableCell>
                  <TableCell className="text-xs">
                    <p className="font-bold">{order.profiles?.full_name || 'Anonymous'}</p>
                    <p className="text-[10px] text-muted-foreground">{order.profiles?.phone || 'No phone'}</p>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-foreground">{formatCurrency(Number(order.total))}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      order.payment_status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <OrderStatusSelector orderId={order.id} status={order.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
