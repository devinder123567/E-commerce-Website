'use client'

import { useRouter } from '@/lib/hooks/useViteNavigation'

interface CategoryItem {
  name: string
  imageUrl: string
  href: string
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    name: 'Mobiles & Tech',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=150&auto=format&fit=crop',
    href: '/products?categoryId=e51631eb-1234-4567-89ab-cdef01234567'
  },
  {
    name: 'Street Apparel',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=150&auto=format&fit=crop',
    href: '/products?categoryId=f61732fc-2345-5678-9abc-def012345678'
  },
  {
    name: 'Fashion & Clothes',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=150&auto=format&fit=crop',
    href: '/products?categoryId=a1111111-1111-1111-1111-111111111111'
  },
  {
    name: 'Gaming & Gear',
    imageUrl: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=150&auto=format&fit=crop',
    href: '/products?categoryId=b2222222-2222-2222-2222-222222222222'
  },
  {
    name: 'Stationery & Office',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=150&auto=format&fit=crop',
    href: '/products?categoryId=c3333333-3333-3333-3333-333333333333'
  },
  {
    name: 'Cosmetics & Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=150&auto=format&fit=crop',
    href: '/products?categoryId=d4444444-4444-4444-4444-444444444444'
  },
  {
    name: 'Grocery & Pantry',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop',
    href: '/products?categoryId=55555555-5555-5555-5555-555555555555'
  },
  {
    name: 'Home & Decor',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=150&auto=format&fit=crop',
    href: '/products?categoryId=66666666-6666-6666-6666-666666666666'
  },
  {
    name: 'Travel & Luggage',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=150&auto=format&fit=crop',
    href: '/products?categoryId=77777777-7777-7777-7777-777777777777'
  }
]

export function CategoryNavRow() {
  const router = useRouter()
  return (
    <div className="w-full border-b border-muted/50 bg-background/60 backdrop-blur-md sticky top-[64px] z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 sm:gap-8 items-center overflow-x-auto py-4 scrollbar-none justify-start lg:justify-center">
          {CATEGORIES_DATA.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => router.push(cat.href)}
              className="group flex flex-col items-center justify-center flex-shrink-0 cursor-pointer"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-muted/40 shadow-sm transition-all duration-300 ease-out group-hover:scale-108 group-hover:border-primary/40 group-hover:shadow-[0_4px_15px_rgba(var(--primary),0.15)] bg-muted/30">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-foreground/85 mt-2 text-center group-hover:text-primary transition-colors tracking-wide max-w-[80px] sm:max-w-[100px] truncate">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
