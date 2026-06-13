'use client'

import { updateOrderStatus } from '@/actions/admin'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function OrderStatusSelector({ orderId, status }: { orderId: string; status: string }) {
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (value: string | null) => {
    if (!value) return
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, value)
      } catch (error) {
        alert('Failed to update status')
      }
    })
  }

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className="w-[140px] bg-background border-muted rounded-full text-xs">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="confirmed">Confirmed</SelectItem>
        <SelectItem value="processing">Processing</SelectItem>
        <SelectItem value="shipped">Shipped</SelectItem>
        <SelectItem value="delivered">Delivered</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
        <SelectItem value="refunded">Refunded</SelectItem>
      </SelectContent>
    </Select>
  )
}
