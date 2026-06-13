'use client'

import { useRouter, useSearchParams } from '@/lib/hooks/useViteNavigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/products?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-full"
      >
        <ChevronLeft size={16} />
      </Button>
      <span className="text-xs font-semibold px-4">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-full"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  )
}
