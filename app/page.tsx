'use client'

import { useEffect, useState } from 'react'
import { getFeaturedProducts, getProducts } from '@/actions/products'
import { getAdvertisements } from '@/actions/admin'
import { ProductCard } from '@/components/products/ProductCard'
import { CategoryNavRow } from '@/components/layout/CategoryNavRow'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight, Sparkles, ShieldCheck, Compass, Zap, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Link } from 'wouter'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { mockDb } from '@/lib/supabase/mockDb'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [newArrivals, setNewArrivals] = useState<any[]>([])
  const [dealsProducts, setDealsProducts] = useState<any[]>([])
  const [aiRecommendedProducts, setAiRecommendedProducts] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [activeAdIndex, setActiveAdIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 18 })

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 4, minutes: 0, seconds: 0 }
        }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function loadData() {
      const timeoutMs = 2500

      const fetchWithTimeoutFallback = async (name: string, promise: Promise<any>, mockFallback: () => any) => {
        let timeoutId: any
        const timeoutPromise = new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            console.warn(`[HomePage] ${name} timed out after ${timeoutMs}ms. Falling back to mockDb.`);
            resolve(mockFallback())
          }, timeoutMs)
        })
        try {
          const result = await Promise.race([
            promise.then((res) => {
              clearTimeout(timeoutId)
              return res
            }),
            timeoutPromise
          ])
          return result
        } catch (err) {
          console.error(`[HomePage] Error fetching ${name}:`, err)
          return mockFallback()
        }
      }

      try {
        const [featuredProductsResult, newArrivalsResponse, adsResponse, allProductsResponse] = await Promise.all([
          fetchWithTimeoutFallback('featuredProducts', getFeaturedProducts(), () => mockDb.getFeaturedProducts()),
          fetchWithTimeoutFallback('newArrivals', getProducts({ limit: 4, sortBy: 'newest' }), () => mockDb.getProducts({ limit: 4, sortBy: 'newest' })),
          fetchWithTimeoutFallback('advertisements', getAdvertisements(), () => mockDb.getAdvertisements()),
          fetchWithTimeoutFallback('allProducts', getProducts({ limit: 20 }), () => mockDb.getProducts({ limit: 20 }))
        ])

        setFeaturedProducts((featuredProductsResult || []) as any[])
        setNewArrivals(((newArrivalsResponse && newArrivalsResponse.data) || []) as any[])
        setAds(((adsResponse || []) as any[]).filter((ad: any) => ad && ad.is_active))
        
        const productsList = (allProductsResponse && allProductsResponse.data) || []
        const deals = productsList.filter((p: any) => p && p.compare_price && Number(p.compare_price) > Number(p.price)).slice(0, 4)
        setDealsProducts(deals.length > 0 ? deals : productsList.slice(0, 4))
        setAiRecommendedProducts(productsList.slice(1, 5))
      } catch (error) {
        console.error('Error loading home page data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (ads.length <= 1) return
    const interval = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % ads.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [ads])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-16 pb-16">
      <CategoryNavRow />
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-muted/30 via-background to-background py-20 lg:py-32 border-b border-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-6" data-aos="fade-right">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1 text-xs font-bold text-primary uppercase tracking-wider animate-pulse">
              <Sparkles size={12} /> Curated Collections Drop
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none">
              Modern Aesthetics.<br />
              <span className="text-gradient-animate">
                Exceptional Quality.
              </span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Explore our massive range of fashion accessories, premium cosmetics, smart tech gadgets, and lifestyle essentials. Discover unbeatable value and speed on everything you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/products"
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-full gap-2 px-8 font-bold text-sm shadow-xl shadow-primary/20')}
              >
                Shop Catalog <ArrowRight size={16} />
              </Link>
              <Link
                href="/products?categoryId=e51631eb-1234-4567-89ab-cdef01234567"
                className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'rounded-full px-8 font-bold text-sm border-muted hover:bg-muted/35')}
              >
                Explore Tech
              </Link>
            </div>
          </div>

          {ads.length > 0 ? (
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative aspect-[4/3] rounded-3xl overflow-hidden border border-muted/60 bg-muted/20 backdrop-blur-md shadow-2xl group/slider" data-aos="fade-left" data-aos-delay="200">
              {ads.map((ad, idx) => (
                <div
                  key={ad.id}
                  className={cn(
                    "absolute inset-0 transition-all duration-700 ease-in-out",
                    idx === activeAdIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-98 pointer-events-none z-0"
                  )}
                >
                  {/* Blurred cover backdrop */}
                  <img
                    src={ad.image_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-30 pointer-events-none"
                  />
                  {/* Fully visible contain-fit image */}
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="absolute inset-0 w-full h-full object-contain opacity-95 hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-background/50 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-2xl z-20">
                    <div className="min-w-0 pr-4">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">{ad.label || 'Featured'}</p>
                      <h4 className="font-extrabold text-sm text-foreground mt-1 truncate">{ad.title}</h4>
                      {ad.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{ad.description}</p>}
                    </div>
                    <Link
                      href={ad.link_url}
                      className={cn(buttonVariants({ size: 'sm' }), 'rounded-full px-5 font-bold text-xs flex-shrink-0')}
                    >
                      {ad.button_text || 'Buy Now'}
                    </Link>
                  </div>
                </div>
              ))}

              {/* Slider Controls */}
              {ads.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveAdIndex((prev) => (prev - 1 + ads.length) % ads.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/60 hover:bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground opacity-0 group-hover/slider:opacity-100 transition-opacity z-20"
                    title="Previous Slide"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveAdIndex((prev) => (prev + 1) % ads.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/60 hover:bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground opacity-0 group-hover/slider:opacity-100 transition-opacity z-20"
                    title="Next Slide"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {ads.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveAdIndex(idx)}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all",
                          idx === activeAdIndex ? "bg-primary w-3.5" : "bg-white/50 hover:bg-white"
                        )}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative aspect-[4/3] rounded-3xl overflow-hidden border border-muted/60 bg-muted/20 backdrop-blur-md shadow-2xl" data-aos="fade-left" data-aos-delay="200">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
                alt="Premium Headphones Hero"
                className="absolute inset-0 w-full h-full object-cover opacity-85 hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-background/50 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-2xl">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Featured Item</p>
                  <h4 className="font-extrabold text-sm text-foreground mt-1">Noise Cancelling Studio Pro</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">$299.00</p>
                </div>
                <Link
                  href="/products/noise-cancelling-studio-pro"
                  className={cn(buttonVariants({ size: 'sm' }), 'rounded-full px-4 font-bold text-xs')}
                >
                  Buy Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Today's Deals (Lightning Deals with countdown) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6" data-aos="fade-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-muted/50 pb-4 gap-4">
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
              <Clock className="text-primary animate-pulse" size={20} /> Today&apos;s Deals
            </h2>
            <p className="text-muted-foreground text-xs">Unbelievable discounts. Active for a limited time only!</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-bold text-primary tracking-wide">
            Deals end in: {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
          </div>
        </div>

        {dealsProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No deals active right now. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dealsProducts.map((prod) => {
              const claimedPercent = Math.floor(35 + (parseInt(prod.id.slice(-1)) || 4) * 5) % 100
              return (
                <div key={prod.id} className="space-y-2 relative group">
                  <ProductCard product={prod} />
                  {/* Claimed Indicator Progress Bar */}
                  <div className="px-1 text-left space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <span>{claimedPercent}% Claimed</span>
                      <span className="text-primary font-black">Deal of the Day</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${claimedPercent}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Core Value Badges */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4 p-5 bg-muted/20 border border-muted/30 rounded-2xl backdrop-blur-sm" data-aos="fade-up" data-aos-delay="0">
            <div className="p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Lightning Fast Delivery</h4>
              <p className="text-xs text-muted-foreground mt-1">Free standard shipping on orders over $150.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 bg-muted/20 border border-muted/30 rounded-2xl backdrop-blur-sm" data-aos="fade-up" data-aos-delay="100">
            <div className="p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Secure Payments</h4>
              <p className="text-xs text-muted-foreground mt-1">Encrypted checkout processing powered by Stripe.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 bg-muted/20 border border-muted/30 rounded-2xl backdrop-blur-sm" data-aos="fade-up" data-aos-delay="200">
            <div className="p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
              <Compass size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Eco-Friendly Crafting</h4>
              <p className="text-xs text-muted-foreground mt-1">Sustainably sourced premium material fabrics.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 bg-muted/20 border border-muted/30 rounded-2xl backdrop-blur-sm" data-aos="fade-up" data-aos-delay="300">
            <div className="p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Easy Exchanges</h4>
              <p className="text-xs text-muted-foreground mt-1">Hassle-free 30 day return/exchange window.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8" data-aos="fade-up">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Explore Categories</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Curated item aesthetics for tech lovers and fashion-forward individuals.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/products?categoryId=e51631eb-1234-4567-89ab-cdef01234567" className="group block relative overflow-hidden aspect-[16/9] rounded-3xl border border-muted/60 bg-muted/20" data-aos="fade-right">
            <img
              src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop"
              alt="Tech category banner"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-103 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <h3 className="text-2xl font-black text-white">TECH & DEVICES</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">Minimalist desk accessories, charging bricks, and mechanical keys.</p>
              <div className="inline-flex items-center gap-1 text-xs text-primary font-bold mt-4 uppercase tracking-wider">
                Browse Gear <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          <Link href="/products?categoryId=f61732fc-2345-5678-9abc-def012345678" className="group block relative overflow-hidden aspect-[16/9] rounded-3xl border border-muted/60 bg-muted/20" data-aos="fade-left">
            <img
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop"
              alt="Apparel category banner"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-103 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <h3 className="text-2xl font-black text-white">STREET APPAREL</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">Premium quality hoodies, sweatpants, and everyday wear essentials.</p>
              <div className="inline-flex items-center gap-1 text-xs text-primary font-bold mt-4 uppercase tracking-wider">
                Browse Outfits <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8" data-aos="fade-up">
        <div className="flex items-end justify-between border-b border-muted/50 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">Featured Products</h2>
            <p className="text-muted-foreground text-xs mt-1">Our customer favourites, handpicked for you.</p>
          </div>
          <Link
            href="/products?sortBy=rating"
            className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-full text-xs font-semibold gap-1 hover:text-primary')}
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Check back later! No featured items available currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banners */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8" data-aos="zoom-in">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-muted/20 to-muted/80 border border-muted/50 py-16 px-8 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="text-[10px] font-extrabold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-widest">Limited promotion</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">SUMMERDROP20</h2>
            <p className="text-slate-200 text-sm leading-relaxed">
              Use code <strong className="text-white bg-white/10 px-2 py-0.5 rounded font-mono">SUMMERDROP20</strong> at checkout to claim <strong className="text-white">20% off</strong> all products. Valid on order subtotals over $50.00.
            </p>
          </div>
          <Link
            href="/products"
            className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }), 'rounded-full font-bold px-8 shadow-2xl')}
          >
            Get Discount Now
          </Link>
        </div>
      </section>

      {/* Top Brands Showcase */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6" data-aos="fade-up">
        <div className="border-b border-muted/50 pb-4 text-left">
          <h2 className="text-2xl font-black tracking-tight uppercase">Top Brands</h2>
          <p className="text-muted-foreground text-xs mt-1">Shop premium products from world-renowned official labels.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { 
              name: 'Sony', 
              label: 'Audio & Tech', 
              logo: (
                <span className="text-xl font-bold tracking-widest text-foreground select-none" style={{ fontFamily: '"Clarendon", "Georgia", serif', fontWeight: 900 }}>
                  SONY
                </span>
              )
            },
            { 
              name: 'Apple', 
              label: 'Devices', 
              logo: (
                <svg viewBox="0 0 16 16" className="w-8 h-8 fill-current text-foreground" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"/>
                </svg>
              )
            },
            { 
              name: 'Nike', 
              label: 'Sports Gear', 
              logo: (
                <svg viewBox="0 0 24 24" className="w-12 h-6 fill-current text-foreground" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 5.25L4.85 15.17c-1.42.73-2.15.54-2.15-.47 0-.91 1.22-3.13 3.65-6.68C8.78 4.47 12.87 1 15.61 0c-1.62.97-3.03 2.76-3.8 4.7-.68 1.76-.14 3.03 1.57 3.03C15.33 7.73 19.38 5.6 24 5.25z"/>
                </svg>
              )
            },
            { 
              name: 'Razer', 
              label: 'Gaming', 
              logo: (
                <span className="text-base font-extrabold tracking-widest text-[#00ff00] select-none" style={{ fontFamily: '"Orbitron", "Courier New", monospace', letterSpacing: '4px' }}>
                  RΛZΞR
                </span>
              )
            },
            { 
              name: 'Zara', 
              label: 'Apparel', 
              logo: (
                <span className="text-2xl font-black text-foreground select-none" style={{ fontFamily: '"Didot", "Bodoni MT", "Times New Roman", serif', letterSpacing: '-2.5px', transform: 'scaleY(0.9)' }}>
                  ZARA
                </span>
              )
            },
            { 
              name: 'L\'Oreal', 
              label: 'Cosmetics', 
              logo: (
                <span className="text-sm font-semibold tracking-widest text-foreground select-none" style={{ fontFamily: '"Century Gothic", "Montserrat", sans-serif', letterSpacing: '3px' }}>
                  L&apos;ORÉAL
                </span>
              )
            }
          ].map((brand, idx) => (
            <Link
              key={idx}
              href={`/products?brand=${brand.name}`}
              className="group p-5 bg-muted/15 border border-muted/30 rounded-2xl flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-muted/20 transition-all duration-300 min-h-[120px]"
            >
              <div className="h-12 flex items-center justify-center filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-300">
                {brand.logo}
              </div>
              <h4 className="font-extrabold text-sm text-foreground mt-3 uppercase tracking-wider">{brand.name}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">{brand.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8" data-aos="fade-up">
        <div className="flex items-end justify-between border-b border-muted/50 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">New Arrivals</h2>
            <p className="text-muted-foreground text-xs mt-1">Freshly stocked accessories and apparel items.</p>
          </div>
          <Link
            href="/products?sortBy=newest"
            className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-full text-xs font-semibold gap-1 hover:text-primary')}
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {newArrivals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Check back later! No new arrivals available currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* AI Recommendations */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8" data-aos="fade-up">
        <div className="flex items-end justify-between border-b border-muted/50 pb-4">
          <div className="text-left space-y-1">
            <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={10} /> Smart Suggestions
            </span>
            <h2 className="text-2xl font-black tracking-tight uppercase mt-2">AI Recommendations</h2>
            <p className="text-muted-foreground text-xs">Personalized product suggestions curated by our smart matching system.</p>
          </div>
          <Link
            href="/products"
            className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-full text-xs font-semibold gap-1 hover:text-primary')}
          >
            Explore More <ArrowRight size={14} />
          </Link>
        </div>
        {aiRecommendedProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Load more items to see recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {aiRecommendedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8" data-aos="fade-up">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Customer Testimonials</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Read stories and feedback from verified purchasers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-muted/10 border border-muted/50 rounded-2xl space-y-4" data-aos="fade-up" data-aos-delay="0">
            <p className="text-sm italic text-muted-foreground leading-relaxed">
              &quot;The headphones are fantastic. Extremely solid noise cancellation, sleek dark aesthetics, and rapid delivery. Will buy from EliteCart again!&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-foreground to-muted-foreground" />
              <div>
                <h5 className="text-xs font-bold text-foreground">Sarah Jenkins</h5>
                <p className="text-[10px] text-muted-foreground">Verified Purchaser</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-muted/10 border border-muted/50 rounded-2xl space-y-4" data-aos="fade-up" data-aos-delay="100">
            <p className="text-sm italic text-muted-foreground leading-relaxed">
              &quot;Beautiful streetwear hoodie. Perfect heavy-weight cotton feel. Fitting is extremely cozy and has lasted 10+ washes looking identical.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500" />
              <div>
                <h5 className="text-xs font-bold text-foreground">Marcus Vance</h5>
                <p className="text-[10px] text-muted-foreground">Verified Purchaser</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-muted/10 border border-muted/50 rounded-2xl space-y-4" data-aos="fade-up" data-aos-delay="200">
            <p className="text-sm italic text-muted-foreground leading-relaxed">
              &quot;The checkout flow was so quick. Applied a promo code, used Stripe, and the tracking was updated in real time. Product quality is top tier.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500" />
              <div>
                <h5 className="text-xs font-bold text-foreground">Elena Rostova</h5>
                <p className="text-[10px] text-muted-foreground">Verified Purchaser</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
