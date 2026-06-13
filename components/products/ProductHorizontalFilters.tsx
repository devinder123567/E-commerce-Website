'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from '@/lib/hooks/useViteNavigation'
import { Check, X, RotateCcw, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { mockDb } from '@/lib/supabase/mockDb'

export function ProductHorizontalFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Active filter state from search parameters
  const activeSort = searchParams.get('sortBy') || 'newest'
  const activeCategoryId = searchParams.get('categoryId') || ''
  const activeMinPrice = searchParams.get('minPrice') || ''
  const activeMaxPrice = searchParams.get('maxPrice') || ''
  const activeBrand = searchParams.get('brand') || ''
  const activeColor = searchParams.get('color') || ''
  const activeSize = searchParams.get('size') || ''
  const activeRating = searchParams.get('rating') || ''

  // Dialog / Modal open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false)

  // Filters Modal active category tab
  const [modalActiveTab, setModalActiveTab] = useState<'price' | 'brand' | 'color' | 'size' | 'rating'>('price')

  // Local filter states (synced with params and editable in overlays)
  const [minPrice, setMinPrice] = useState(activeMinPrice)
  const [maxPrice, setMaxPrice] = useState(activeMaxPrice)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState<string>(activeRating)

  // Options
  const BRANDS = ['Apple', 'Sony', 'Nike', 'Razer', 'Zara', "L'Oreal", 'Logitech', 'Elite', 'Parker', 'Chanel', 'Dior', 'Titan']
  const COLORS = ['Black', 'White', 'Red', 'Blue', 'Grey', 'Slate', 'Silver', 'Brown', 'Gold', 'Rose Gold', 'Green']

  const getColorHex = (cName: string) => {
    const c = cName.toLowerCase()
    if (c === 'slate') return '#64748b'
    if (c === 'silver') return '#cbd5e1'
    if (c === 'grey') return '#94a3b8'
    if (c === 'rose gold') return '#b76e79'
    if (c === 'gold') return '#ffd700'
    return c
  }
  const SIZES = ['S', 'M', 'L', 'XL', 'One Size']
  const RATINGS = [
    { value: '4', label: '4★ & above' },
    { value: '3', label: '3★ & above' },
    { value: '2', label: '2★ & above' }
  ]

  // Update local states when search params change
  useEffect(() => {
    setMinPrice(activeMinPrice)
    setMaxPrice(activeMaxPrice)
    setSelectedBrands(activeBrand ? activeBrand.split(',') : [])
    setSelectedColors(activeColor ? activeColor.split(',') : [])
    setSelectedSizes(activeSize ? activeSize.split(',') : [])
    setSelectedRating(activeRating)
  }, [activeMinPrice, activeMaxPrice, activeBrand, activeColor, activeSize, activeRating])

  // Click outside listener for desktop dropdowns
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Navigation / Parameter helpers
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    params.delete('page') // reset page
    router.push(`/products?${params.toString()}`)
    setOpenDropdown(null)
  }

  const handlePillClick = (filterName: 'price' | 'brand' | 'color' | 'size') => {
    // Detect mobile viewport (under 768px)
    if (window.innerWidth < 768) {
      setModalActiveTab(filterName)
      setIsFiltersModalOpen(true)
    } else {
      setOpenDropdown(openDropdown === filterName ? null : filterName)
    }
  }

  const applyAllModalFilters = () => {
    updateParams({
      minPrice: minPrice,
      maxPrice: maxPrice,
      brand: selectedBrands.join(','),
      color: selectedColors.join(','),
      size: selectedSizes.join(','),
      rating: selectedRating
    })
    setIsFiltersModalOpen(false)
  }

  const clearAllFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setSelectedBrands([])
    setSelectedColors([])
    setSelectedSizes([])
    setSelectedRating('')
    router.push('/products')
    setOpenDropdown(null)
    setIsFiltersModalOpen(false)
  }

  // Live matching count (mockDb query in-memory)
  const getLiveMatchingCount = () => {
    try {
      const { count } = mockDb.getProducts({
        categoryId: activeCategoryId || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        brand: selectedBrands.join(','),
        color: selectedColors.join(','),
        size: selectedSizes.join(','),
        rating: selectedRating ? parseFloat(selectedRating) : undefined,
        search: searchParams.get('q') || undefined,
        limit: 1000 // get all matching count
      })
      return count
    } catch (e) {
      return 0
    }
  }

  // Toggles for local states
  const toggleBrand = (b: string) => {
    setSelectedBrands(prev => prev.includes(b) ? prev.filter(item => item !== b) : [...prev, b])
  }
  const toggleColor = (c: string) => {
    setSelectedColors(prev => prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c])
  }
  const toggleSize = (s: string) => {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s])
  }

  const handlePricePreset = (min: string, max: string) => {
    setMinPrice(min)
    setMaxPrice(max)
  }

  const handleSort = (sortValue: string) => {
    updateParams({ sortBy: sortValue })
  }

  const activeFiltersCount = [
    activeMinPrice || activeMaxPrice ? 1 : 0,
    selectedBrands.length ? 1 : 0,
    selectedColors.length ? 1 : 0,
    selectedSizes.length ? 1 : 0,
    activeRating ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="w-full space-y-3" ref={dropdownRef}>
      
      {/* Scrollable Filters Container Row */}
      <div className="w-full border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl p-2.5 flex items-center justify-between gap-4">
        
        {/* Horizontal Filters Scroll Box */}
        <div className="relative flex items-center gap-1.5 overflow-x-auto overflow-y-hidden pb-0.5 scrollbar-none flex-grow">
          
          {/* SORT Pill (Mobile: opens Drawer, Desktop: Toggle) */}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsSortDrawerOpen(true)
              } else {
                setOpenDropdown(openDropdown === 'sort' ? null : 'sort')
              }
            }}
            className={cn(
              "flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all shadow-sm focus:outline-none",
              activeSort !== 'newest'
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-muted hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
            )}
          >
            Sort By
          </button>

          {/* FILTER Pill (Click opens full Flipkart modal on all viewports) */}
          <button
            onClick={() => setIsFiltersModalOpen(true)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-primary text-[11px] font-extrabold bg-primary/5 text-primary hover:bg-primary/10 transition-all shadow-sm focus:outline-none"
            )}
          >
            <Filter size={11} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Price Range Pill */}
          <button
            onClick={() => handlePillClick('price')}
            className={cn(
              "flex-shrink-0 px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all shadow-sm focus:outline-none",
              activeMinPrice || activeMaxPrice
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-muted hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
            )}
          >
            Price Range
          </button>

          {/* Brand Pill */}
          <button
            onClick={() => handlePillClick('brand')}
            className={cn(
              "flex-shrink-0 px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all shadow-sm focus:outline-none",
              activeBrand
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-muted hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
            )}
          >
            Brand
            {selectedBrands.length > 0 && <span className="ml-1 text-[9px] font-extrabold">({selectedBrands.length})</span>}
          </button>

          {/* Color Pill */}
          <button
            onClick={() => handlePillClick('color')}
            className={cn(
              "flex-shrink-0 px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all shadow-sm focus:outline-none",
              activeColor
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-muted hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
            )}
          >
            Color
            {selectedColors.length > 0 && <span className="ml-1 text-[9px] font-extrabold">({selectedColors.length})</span>}
          </button>

          {/* Size Pill */}
          <button
            onClick={() => handlePillClick('size')}
            className={cn(
              "flex-shrink-0 px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all shadow-sm focus:outline-none",
              activeSize
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-muted hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
            )}
          >
            Size
            {selectedSizes.length > 0 && <span className="ml-1 text-[9px] font-extrabold">({selectedSizes.length})</span>}
          </button>

          {/* Top Rated Chip Pill */}
          <button
            onClick={() => updateParams({ rating: activeRating ? null : '4' })}
            className={cn(
              "flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all shadow-sm focus:outline-none",
              activeRating
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-muted hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
            )}
          >
            Top Rated
          </button>

          {/* Latest Trends Chip Pill */}
          <button
            onClick={() => updateParams({ sortBy: activeSort === 'newest' ? null : 'newest' })}
            className={cn(
              "flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all shadow-sm focus:outline-none",
              activeSort === 'newest'
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-muted hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
            )}
          >
            Latest Trends
          </button>
        </div>

        {/* Clear Filters Link (Hidden if no filters active) */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex-shrink-0 text-[10px] font-extrabold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-colors px-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP FLOATING DROPDOWN OVERLAYS */}
      {/* ========================================================================= */}
      {openDropdown && (
        <div className="hidden md:block relative">
          
          {/* SORT Dropdown */}
          {openDropdown === 'sort' && (
            <div className="absolute left-0 mt-1 w-56 bg-background/95 backdrop-blur-xl border border-muted/80 rounded-2xl shadow-2xl p-4 z-40 space-y-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Sort Products By</h4>
              {[
                { value: 'newest', label: 'Relevance / Newest' },
                { value: 'rating', label: 'Popularity / Top Rated' },
                { value: 'price_asc', label: 'Price -- Low to High' },
                { value: 'price_desc', label: 'Price -- High to Low' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className="w-full text-left py-1.5 px-2.5 rounded-xl hover:bg-muted/40 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-between"
                >
                  {opt.label}
                  {activeSort === opt.value && <Check size={12} className="text-primary" />}
                </button>
              ))}
            </div>
          )}

          {/* PRICE Dropdown */}
          {openDropdown === 'price' && (
            <div className="absolute left-10 mt-1 w-64 bg-background/95 backdrop-blur-xl border border-muted/80 rounded-2xl shadow-2xl p-4 z-40 space-y-4">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Price Presets</h4>
              
              {/* Presets */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                <button onClick={() => handlePricePreset('', '50')} className="py-1 px-2 bg-muted/45 hover:bg-muted rounded-md text-left">Under $50</button>
                <button onClick={() => handlePricePreset('50', '100')} className="py-1 px-2 bg-muted/45 hover:bg-muted rounded-md text-left">$50 - $100</button>
                <button onClick={() => handlePricePreset('100', '200')} className="py-1 px-2 bg-muted/45 hover:bg-muted rounded-md text-left">$100 - $200</button>
                <button onClick={() => handlePricePreset('200', '399')} className="py-1 px-2 bg-muted/45 hover:bg-muted rounded-md text-left">$200 - $399</button>
                <button onClick={() => handlePricePreset('399', '799')} className="py-1 px-2 bg-muted/45 hover:bg-muted rounded-md text-left">$399 - $799</button>
                <button onClick={() => handlePricePreset('799', '')} className="py-1 px-2 bg-muted/45 hover:bg-muted rounded-md text-left">Over $799</button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-muted/50">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Min ($)</label>
                  <Input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="border-muted rounded-xl h-8 text-xs font-bold" />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Max ($)</label>
                  <Input type="number" placeholder="500" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="border-muted rounded-xl h-8 text-xs font-bold" />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-muted/50">
                <Button onClick={() => updateParams({ minPrice, maxPrice })} size="sm" className="rounded-full flex-grow text-[10px] font-bold uppercase tracking-wider">Apply</Button>
                <Button onClick={() => { setMinPrice(''); setMaxPrice(''); updateParams({ minPrice: null, maxPrice: null }) }} size="sm" variant="outline" className="rounded-full text-[10px] font-bold uppercase tracking-wider">Clear</Button>
              </div>
            </div>
          )}

          {/* BRAND Dropdown */}
          {openDropdown === 'brand' && (
            <div className="absolute left-24 mt-1 w-56 bg-background/95 backdrop-blur-xl border border-muted/80 rounded-2xl shadow-2xl p-4 z-40 space-y-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Select Brands</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                {BRANDS.map(brand => (
                  <label key={brand} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer py-0.5">
                    <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="rounded border-muted text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer" />
                    {brand}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-muted/50">
                <Button onClick={() => updateParams({ brand: selectedBrands.join(',') })} size="sm" className="rounded-full flex-grow text-[10px] font-bold uppercase tracking-wider">Apply</Button>
                <Button onClick={() => { setSelectedBrands([]); updateParams({ brand: null }) }} size="sm" variant="outline" className="rounded-full text-[10px] font-bold uppercase tracking-wider">Clear</Button>
              </div>
            </div>
          )}

          {/* COLOR Dropdown */}
          {openDropdown === 'color' && (
            <div className="absolute left-40 mt-1 w-56 bg-background/95 backdrop-blur-xl border border-muted/80 rounded-2xl shadow-2xl p-4 z-40 space-y-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Select Colors</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                {COLORS.map(color => (
                  <label key={color} className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer py-0.5">
                    <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => toggleColor(color)} className="rounded border-muted text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer" />
                    <span className="w-3.5 h-3.5 rounded-full border border-muted" style={{ backgroundColor: getColorHex(color) }} />
                    {color}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-muted/50">
                <Button onClick={() => updateParams({ color: selectedColors.join(',') })} size="sm" className="rounded-full flex-grow text-[10px] font-bold uppercase tracking-wider">Apply</Button>
                <Button onClick={() => { setSelectedColors([]); updateParams({ color: null }) }} size="sm" variant="outline" className="rounded-full text-[10px] font-bold uppercase tracking-wider">Clear</Button>
              </div>
            </div>
          )}

          {/* SIZE Dropdown */}
          {openDropdown === 'size' && (
            <div className="absolute left-56 mt-1 w-56 bg-background/95 backdrop-blur-xl border border-muted/80 rounded-2xl shadow-2xl p-4 z-40 space-y-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Select Sizes</h4>
              <div className="flex flex-wrap gap-2 py-1">
                {SIZES.map(size => {
                  const isSel = selectedSizes.includes(size)
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "w-10 h-10 rounded-xl border text-xs font-extrabold flex items-center justify-center transition-all",
                        isSel ? "bg-primary border-primary text-primary-foreground shadow-md" : "bg-muted/30 border-muted text-muted-foreground hover:border-muted-foreground"
                      )}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2 pt-2 border-t border-muted/50">
                <Button onClick={() => updateParams({ size: selectedSizes.join(',') })} size="sm" className="rounded-full flex-grow text-[10px] font-bold uppercase tracking-wider">Apply</Button>
                <Button onClick={() => { setSelectedSizes([]); updateParams({ size: null }) }} size="sm" variant="outline" className="rounded-full text-[10px] font-bold uppercase tracking-wider">Clear</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE SORT DRAWER (SLIDE UP) */}
      {/* ========================================================================= */}
      {isSortDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:hidden">
          <div className="w-full bg-background border-t border-muted/80 rounded-t-3xl p-6 space-y-5 animate-slide-up max-w-lg">
            <div className="flex items-center justify-between pb-3 border-b border-muted/50">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">SORT BY</h3>
              <button onClick={() => setIsSortDrawerOpen(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { value: 'newest', label: 'Relevance' },
                { value: 'rating', label: 'Popularity' },
                { value: 'price_asc', label: 'Price -- Low to High' },
                { value: 'price_desc', label: 'Price -- High to Low' }
              ].map(opt => {
                const isChecked = activeSort === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      handleSort(opt.value)
                      setIsSortDrawerOpen(false)
                    }}
                    className="w-full flex items-center justify-between text-left py-2.5 text-sm font-bold text-foreground focus:outline-none"
                  >
                    <span>{opt.label}</span>
                    <span className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center",
                      isChecked ? "border-primary bg-primary" : "border-muted-foreground/40"
                    )}>
                      {isChecked && <span className="w-2.5 h-2.5 rounded-full bg-background" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLIPKART-STYLE TWO-COLUMN FILTERS MODAL */}
      {/* ========================================================================= */}
      {isFiltersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="w-full h-full md:w-[650px] md:h-[550px] md:rounded-3xl bg-background border border-muted/50 flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="h-14 border-b border-muted/50 flex items-center justify-between px-5 bg-background">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsFiltersModalOpen(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
                <h3 className="text-base font-extrabold text-foreground uppercase tracking-wide">Filters</h3>
              </div>
              <button onClick={clearAllFilters} className="text-xs font-black uppercase text-rose-500 hover:text-rose-600 transition-colors">
                Clear Filters
              </button>
            </div>

            {/* Modal Two-Column Main Content */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              
              {/* Left Column - Tabs List */}
              <div className="w-2/5 border-r border-muted/50 bg-muted/10 overflow-y-auto">
                {[
                  { key: 'price', label: 'Price' },
                  { key: 'brand', label: 'Brand' },
                  { key: 'color', label: 'Color' },
                  { key: 'size', label: 'Size' },
                  { key: 'rating', label: 'Customer Ratings' }
                ].map(tab => {
                  const isActive = modalActiveTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setModalActiveTab(tab.key as any)}
                      className={cn(
                        "w-full text-left py-4 px-5 text-xs font-extrabold uppercase tracking-wide border-l-4 transition-all focus:outline-none",
                        isActive
                          ? "bg-background border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
                      )}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Right Column - Options List */}
              <div className="w-3/5 p-6 overflow-y-auto bg-background">
                
                {/* PRICE OPTIONS */}
                {modalActiveTab === 'price' && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Filter by Price</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Min Price</label>
                        <Input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="border-muted rounded-xl text-xs font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Max Price</label>
                        <Input type="number" placeholder="500" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="border-muted rounded-xl text-xs font-bold" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Price Ranges</span>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                        <button onClick={() => handlePricePreset('', '50')} className={cn("py-2 px-3 rounded-xl border text-left", minPrice === '' && maxPrice === '50' ? "border-primary bg-primary/10 text-primary" : "border-muted bg-muted/20")}>Under $50</button>
                        <button onClick={() => handlePricePreset('50', '100')} className={cn("py-2 px-3 rounded-xl border text-left", minPrice === '50' && maxPrice === '100' ? "border-primary bg-primary/10 text-primary" : "border-muted bg-muted/20")}>$50 - $100</button>
                        <button onClick={() => handlePricePreset('100', '200')} className={cn("py-2 px-3 rounded-xl border text-left", minPrice === '100' && maxPrice === '200' ? "border-primary bg-primary/10 text-primary" : "border-muted bg-muted/20")}>$100 - $200</button>
                        <button onClick={() => handlePricePreset('200', '399')} className={cn("py-2 px-3 rounded-xl border text-left", minPrice === '200' && maxPrice === '399' ? "border-primary bg-primary/10 text-primary" : "border-muted bg-muted/20")}>$200 - $399</button>
                        <button onClick={() => handlePricePreset('399', '799')} className={cn("py-2 px-3 rounded-xl border text-left", minPrice === '399' && maxPrice === '799' ? "border-primary bg-primary/10 text-primary" : "border-muted bg-muted/20")}>$399 - $799</button>
                        <button onClick={() => handlePricePreset('799', '')} className={cn("py-2 px-3 rounded-xl border text-left", minPrice === '799' && maxPrice === '' ? "border-primary bg-primary/10 text-primary" : "border-muted bg-muted/20")}>Over $799</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* BRAND OPTIONS */}
                {modalActiveTab === 'brand' && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Filter by Brand</h4>
                    <div className="space-y-3">
                      {BRANDS.map(brand => (
                        <label key={brand} className="flex items-center gap-3 text-xs font-bold text-foreground cursor-pointer py-1 hover:text-primary transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="rounded border-muted text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                          {brand}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* COLOR OPTIONS */}
                {modalActiveTab === 'color' && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Filter by Color</h4>
                    <div className="space-y-3">
                      {COLORS.map(color => (
                        <label key={color} className="flex items-center gap-3.5 text-xs font-bold text-foreground cursor-pointer py-1 hover:text-primary transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedColors.includes(color)}
                            onChange={() => toggleColor(color)}
                            className="rounded border-muted text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                          <span className="w-4 h-4 rounded-full border border-muted shadow-sm" style={{ backgroundColor: getColorHex(color) }} />
                          {color}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* SIZE OPTIONS */}
                {modalActiveTab === 'size' && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-3">Filter by Size</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {SIZES.map(size => {
                        const isSel = selectedSizes.includes(size)
                        return (
                          <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={cn(
                              "h-11 rounded-xl border text-xs font-extrabold flex items-center justify-center transition-all",
                              isSel
                                ? "bg-primary border-primary text-primary-foreground shadow-md"
                                : "bg-muted/30 border-muted text-muted-foreground hover:border-muted-foreground"
                            )}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* CUSTOMER RATING OPTIONS */}
                {modalActiveTab === 'rating' && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Filter by Customer Rating</h4>
                    <div className="space-y-3">
                      {RATINGS.map(rate => {
                        const isChecked = selectedRating === rate.value
                        return (
                          <button
                            key={rate.value}
                            onClick={() => setSelectedRating(selectedRating === rate.value ? '' : rate.value)}
                            className="w-full flex items-center justify-between text-left py-2 text-xs font-bold text-foreground focus:outline-none"
                          >
                            <span>{rate.label}</span>
                            <span className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center",
                              isChecked ? "border-primary bg-primary" : "border-muted-foreground/40"
                            )}>
                              {isChecked && <span className="w-2 h-2 rounded-full bg-background" />}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="h-16 border-t border-muted/50 bg-background flex items-center justify-between px-6">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {getLiveMatchingCount()} Products Found
              </span>
              <button
                onClick={applyAllModalFilters}
                className="bg-[#fb641b] text-white hover:bg-[#e05310] transition-colors font-extrabold uppercase tracking-wider text-xs px-8 py-2.5 rounded-sm shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
