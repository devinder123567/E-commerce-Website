'use client'

import { deleteProduct } from '@/actions/admin'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      startTransition(async () => {
        try {
          await deleteProduct(productId)
        } catch (error) {
          alert('Failed to delete product')
        }
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={handleDelete}
      className="rounded-full w-8 h-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive animate-fade-in"
      title="Delete Product"
    >
      <Trash2 size={14} />
    </Button>
  )
}
