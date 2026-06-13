'use client'

import { useCartStore } from '@/lib/store/cartStore'
import { useAuthStore } from '@/lib/store/authStore'
import { useCart } from '@/lib/hooks/useCart'
import { createClient } from '@/lib/supabase/client'
import { SearchBar } from '../shared/SearchBar'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button, buttonVariants } from '@/components/ui/button'
import { ShoppingBag, Heart, User, Menu, LogOut, LayoutDashboard, Bell, Globe, Check, Plus, Sun, Moon } from 'lucide-react'
import { Link } from 'wouter'
import { useEffect, useState, Suspense } from 'react'
import { useRouter } from '@/lib/hooks/useViteNavigation'
import { cn } from '@/lib/utils'
import { getCategories } from '@/actions/products'

export function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const { user, profile, clearAuth } = useAuthStore()
  const { setDrawerOpen, items } = useCartStore()
  const { mergeCart } = useCart()
  const [categories, setCategories] = useState<any[]>([])
  
  // Notification system
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to EliteCart! Shop premium gadgets and street apparel.', read: false, time: '10m ago' },
    { id: 2, text: 'Summer Sale is LIVE! Use code SUMMERDROP20 to claim 20% discount.', read: false, time: '2h ago' },
    { id: 3, text: 'Gold regalia and ladies raga Titan watches are newly stocked.', read: true, time: '1d ago' },
  ])
  const unreadNotificationsCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  // Currency converter system
  const [currency, setCurrency] = useState('USD')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrency(localStorage.getItem('devi_currency') || 'USD')
    }
  }, [])

  const handleCurrencyChange = (newCurrency: string) => {
    localStorage.setItem('devi_currency', newCurrency)
    setCurrency(newCurrency)
    window.location.reload()
  }

  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await getCategories()
        setCategories(cats || [])
      } catch (err) {
        console.error('Error loading navbar categories:', err)
      }
    }
    loadCats()
  }, [])

  useEffect(() => {
    if (user) {
      mergeCart()
    }
  }, [user, mergeCart])

  const handleSignOut = async () => {
    localStorage.removeItem('devi-mock-session')
    if (!isSupabasePlaceholder()) {
      await supabase.auth.signOut()
    }
    clearAuth()
    router.push('/')
  }

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-muted/80 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black uppercase tracking-tight hover:opacity-90 transition-opacity">
            EliteCart
          </Link>
          {isSupabasePlaceholder() && (
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full" title="Running in LocalStorage Mock Mode. Data is isolated per port and browser profile.">
              Mock Mode
            </span>
          )}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground ml-2">
            {categories.slice(0, 3).map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/products?categoryId=${cat.id}`)}
                className="hover:text-primary transition-colors focus:outline-none bg-transparent border-none p-0 font-semibold"
              >
                {cat.name.split(' & ')[0]}
              </button>
            ))}
            {categories.length > 3 && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none">
                  More
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-muted bg-background/95 backdrop-blur-md">
                  {categories.slice(3).map((cat) => (
                    <DropdownMenuItem key={cat.id} onClick={() => router.push(`/products?categoryId=${cat.id}`)}>
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>

        <div className="hidden sm:flex flex-1 justify-center max-w-sm">
          <Suspense fallback={<div className="h-9 w-full bg-muted rounded-full animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'hidden sm:inline-flex rounded-full flex items-center justify-center font-bold text-xs uppercase tracking-wider text-foreground hover:text-foreground')} title="Switch Currency">
              <Globe className="w-4 h-4 mr-0.5" />
              <span className="text-[9px]">{currency}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 border-muted bg-background/95 backdrop-blur-md">
              <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase">Currency</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-muted/50" />
              <DropdownMenuItem onClick={() => handleCurrencyChange('USD')} className="font-bold flex items-center justify-between text-xs cursor-pointer">
                <span>$ USD</span>
                {currency === 'USD' && <Check size={12} className="text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCurrencyChange('INR')} className="font-bold flex items-center justify-between text-xs cursor-pointer">
                <span>₹ INR</span>
                {currency === 'INR' && <Check size={12} className="text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCurrencyChange('EUR')} className="font-bold flex items-center justify-between text-xs cursor-pointer">
                <span>€ EUR</span>
                {currency === 'EUR' && <Check size={12} className="text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative rounded-full hover:bg-muted p-2 text-foreground/80 hover:text-foreground focus:outline-none hidden sm:inline-flex" title="Notifications" onClick={markAllRead}>
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-muted bg-background/95 backdrop-blur-md p-2 space-y-2">
              <div className="flex justify-between items-center px-2 py-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">New</span>
                )}
              </div>
              <DropdownMenuSeparator className="bg-muted/50" />
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-none">
                {notifications.map((notif) => (
                  <div key={notif.id} className={cn("p-2 rounded-xl text-left transition-colors", notif.read ? "bg-transparent text-muted-foreground" : "bg-primary/5 text-foreground")}>
                    <p className="text-xs font-semibold leading-normal">{notif.text}</p>
                    <span className="text-[9px] text-muted-foreground/60 block mt-1 font-semibold">{notif.time}</span>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/account/wishlist"
            title="Wishlist"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'hidden sm:inline-flex rounded-full text-foreground/80 hover:text-foreground')}
          >
            <Heart className="w-5 h-5" />
          </Link>


          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(true)}
            className="relative rounded-full text-foreground/80 hover:text-foreground"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemsCount}
              </span>
            )}
          </Button>

          {user ? (
            <Link
              href="/account"
              className="hidden sm:flex rounded-full bg-muted text-foreground px-3 h-9 border border-border items-center gap-2 hover:bg-accent transition-colors focus:outline-none text-xs font-bold"
            >
              {profile?.avatar_url ? (
                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="hidden sm:inline max-w-[120px] truncate">
                {profile?.full_name || 'My Account'}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:flex rounded-full px-5')}
            >
              Log In
            </Link>
          )}

          <div className="block md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'rounded-full text-foreground hover:bg-muted/30')}>
                <Menu className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 border-muted bg-background/95 backdrop-blur-md p-2 space-y-1">
                {user ? (
                  <>
                    <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase px-2">Account ({profile?.full_name || 'My Profile'})</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push('/account')} className="cursor-pointer gap-2 font-semibold">
                      <User size={14} className="text-muted-foreground" /> My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/account/orders')} className="cursor-pointer gap-2 font-semibold">
                      <ShoppingBag size={14} className="text-muted-foreground" /> My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/account/wishlist')} className="cursor-pointer gap-2 font-semibold">
                      <Heart size={14} className="text-muted-foreground" /> Wishlist
                    </DropdownMenuItem>
                    {profile?.role === 'admin' && (
                      <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer gap-2 font-semibold text-primary">
                        <LayoutDashboard size={14} /> Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 font-semibold text-rose-500">
                      <LogOut size={14} /> Log Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase px-2">Account</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push('/login')} className="cursor-pointer gap-2 font-semibold">
                      <User size={14} className="text-muted-foreground" /> Log In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/register')} className="cursor-pointer gap-2 font-semibold">
                      <Plus size={14} className="text-muted-foreground" /> Register
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="bg-muted/50" />
                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase px-2">Currency ({currency})</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleCurrencyChange('USD')} className="cursor-pointer flex justify-between font-semibold">
                  <span>$ USD</span>
                  {currency === 'USD' && <Check size={12} className="text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCurrencyChange('INR')} className="cursor-pointer flex justify-between font-semibold">
                  <span>₹ INR</span>
                  {currency === 'INR' && <Check size={12} className="text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCurrencyChange('EUR')} className="cursor-pointer flex justify-between font-semibold">
                  <span>€ EUR</span>
                  {currency === 'EUR' && <Check size={12} className="text-primary" />}
                </DropdownMenuItem>


                <DropdownMenuSeparator className="bg-muted/50" />
                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase px-2">Shop Categories</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push('/products')} className="cursor-pointer font-semibold">
                  All Products
                </DropdownMenuItem>
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} onClick={() => router.push(`/products?categoryId=${cat.id}`)} className="cursor-pointer font-semibold">
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* Secondary Categories Nav Bar */}
      {categories.length > 0 && (
        <div className="border-t border-muted/80 bg-muted/5 py-2 hidden md:block">
          <div className="container mx-auto flex items-center justify-center gap-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/products?categoryId=${cat.id}`)}
                className="hover:text-primary transition-colors duration-150 relative group focus:outline-none bg-transparent border-none p-0 font-bold uppercase tracking-wider"
              >
                {cat.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full" />
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
