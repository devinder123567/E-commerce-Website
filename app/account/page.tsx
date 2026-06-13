'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { useSearchParams, useRouter } from '@/lib/hooks/useViteNavigation'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { getProductsByIds } from '@/actions/products'
import { getUserOrders, updateOrderStatus } from '@/actions/orders'
import { createProduct } from '@/actions/admin'
import { getAddresses, createAddress, updateAddress, deleteAddress, Address } from '@/actions/addresses'
import { updateProfile } from '@/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatDate } from '@/lib/utils/formatDate'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { User, MapPin, ShoppingBag, Heart, LogOut, Edit2, Trash2, Plus, Check, Package, X, LayoutDashboard, Landmark, FileText, Undo2, Ban, ArrowLeftRight } from 'lucide-react'
import { DEFAULT_COUNTRIES, DEFAULT_STATES } from '@/lib/constants/countries'
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

function AccountDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const { user, profile, clearAuth } = useAuthStore()
  const { wishlistProductIds, loading: wishlistHookLoading } = useWishlist()
  
  // Navigation Tabs
  const currentTab = searchParams.get('tab') || 'profile'
  
  // State
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([])
  
  // Profile Form State
  const [editProfileMode, setEditProfileMode] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addrFullName, setAddrFullName] = useState('')
  const [addrPhone, setAddrPhone] = useState('')
  const [addrLine1, setAddrLine1] = useState('')
  const [addrLine2, setAddrLine2] = useState('')
  const [addrCity, setAddrCity] = useState('')
  const [addrState, setAddrState] = useState('')
  const [addrPostalCode, setAddrPostalCode] = useState('')
  const [addrCountry, setAddrCountry] = useState('US')
  const [addrIsDefault, setAddrIsDefault] = useState(false)
  const [addressSaving, setAddressSaving] = useState(false)

  // Cancel/Return and Invoice States
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null)
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<any | null>(null)
  const [returnReason, setReturnReason] = useState('')

  // Seller portal states
  const [sellerProducts, setSellerProducts] = useState<any[]>([])
  const [sellerProdName, setSellerProdName] = useState('')
  const [sellerProdPrice, setSellerProdPrice] = useState('')
  const [sellerProdStock, setSellerProdStock] = useState('')
  const [sellerProdBrand, setSellerProdBrand] = useState('')
  const [sellerProdDesc, setSellerProdDesc] = useState('')
  const [sellerSaving, setSellerSaving] = useState(false)

  // Seller mock sales chart data
  const mockChartData = [
    { name: 'Jan', Sales: 4000, Orders: 240 },
    { name: 'Feb', Sales: 3000, Orders: 198 },
    { name: 'Mar', Sales: 5000, Orders: 320 },
    { name: 'Apr', Sales: 8000, Orders: 480 },
    { name: 'May', Sales: 6000, Orders: 390 },
    { name: 'Jun', Sales: 9500, Orders: 540 }
  ]

  // Sync profile form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  // Load tab data
  useEffect(() => {
    if (!user) return

    async function loadData() {
      setLoading(true)
      try {
        if (currentTab === 'orders') {
          const data = await getUserOrders()
          setOrders(data || [])
        } else if (currentTab === 'addresses') {
          const data = await getAddresses()
          setAddresses(data || [])
        } else if (currentTab === 'wishlist') {
          if (wishlistProductIds.length > 0) {
            const data = await getProductsByIds(wishlistProductIds)
            setWishlistProducts(data || [])
          } else {
            setWishlistProducts([])
          }
        } else if (currentTab === 'seller') {
          const allProds = JSON.parse(localStorage.getItem('devi_mock_products') || '[]')
          setSellerProducts(allProds || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentTab, user, wishlistProductIds])

  // Redirect to login if user not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login?next=/account')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <LoadingSpinner size={32} />
      </div>
    )
  }

  const handleTabChange = (tabName: string) => {
    router.push(`/account?tab=${tabName}`)
  }

  const handleSignOut = async () => {
    localStorage.removeItem('devi-mock-session')
    await supabase.auth.signOut()
    clearAuth()
    router.push('/')
  }

  // Action Handlers
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      await updateOrderStatus(orderId, 'cancelled')
      alert('Order cancelled successfully!')
      const data = await getUserOrders()
      setOrders(data || [])
    } catch (err: any) {
      alert(`Error cancelling order: ${err.message}`)
    }
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReturnOrder) return
    try {
      await updateOrderStatus(selectedReturnOrder.id, 'returned', returnReason)
      alert('Return request submitted successfully!')
      setSelectedReturnOrder(null)
      setReturnReason('')
      const data = await getUserOrders()
      setOrders(data || [])
    } catch (err: any) {
      alert(`Error submitting return: ${err.message}`)
    }
  }

  const handleCreateSellerProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSellerSaving(true)
    try {
      const priceNum = parseFloat(sellerProdPrice)
      const stockNum = parseInt(sellerProdStock)
      if (isNaN(priceNum) || priceNum <= 0) {
        alert('Please enter a valid price.')
        return
      }
      if (isNaN(stockNum) || stockNum < 0) {
        alert('Please enter a valid stock quantity.')
        return
      }

      const slug = sellerProdName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const sku = 'SEL-' + Math.random().toString(36).substr(2, 9).toUpperCase()

      const payload = {
        name: sellerProdName,
        slug,
        description: sellerProdDesc,
        price: priceNum,
        compare_price: null,
        cost_price: null,
        sku,
        stock_quantity: stockNum,
        category_id: 'e51631eb-1234-4567-89ab-cdef01234567', // default to Tech & Devices
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'],
        tags: ['seller', 'marketplace'],
        is_active: true,
        is_featured: false,
        weight: 0,
        variants: []
      }

      await createProduct(payload)
      alert('Product listed successfully on the marketplace!')
      
      setSellerProdName('')
      setSellerProdPrice('')
      setSellerProdStock('')
      setSellerProdBrand('')
      setSellerProdDesc('')
      
      const allProds = JSON.parse(localStorage.getItem('devi_mock_products') || '[]')
      setSellerProducts(allProds || [])
    } catch (err: any) {
      alert(`Error listing product: ${err.message}`)
    } finally {
      setSellerSaving(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      await updateProfile({ full_name: fullName, phone: phone })
      setEditProfileMode(false)
      alert('Profile updated successfully!')
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`)
    } finally {
      setProfileSaving(false)
    }
  }

  const handleOpenAddAddress = () => {
    setEditingAddress(null)
    setAddrFullName('')
    setAddrPhone('')
    setAddrLine1('')
    setAddrLine2('')
    setAddrCity('')
    setAddrState('')
    setAddrPostalCode('')
    setAddrCountry('US')
    setAddrIsDefault(false)
    setShowAddressForm(true)
  }

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr)
    setAddrFullName(addr.full_name)
    setAddrPhone(addr.phone)
    setAddrLine1(addr.line1)
    setAddrLine2(addr.line2 || '')
    setAddrCity(addr.city)
    setAddrState(addr.state)
    setAddrPostalCode(addr.postal_code)
    setAddrCountry(addr.country)
    setAddrIsDefault(addr.is_default)
    setShowAddressForm(true)
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddressSaving(true)
    const payload = {
      full_name: addrFullName,
      phone: addrPhone,
      line1: addrLine1,
      line2: addrLine2 || null,
      city: addrCity,
      state: addrState,
      postal_code: addrPostalCode,
      country: addrCountry,
      is_default: addrIsDefault
    }

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, payload)
        alert('Address updated successfully!')
      } else {
        await createAddress(payload)
        alert('Address created successfully!')
      }
      setShowAddressForm(false)
      // reload address list
      const data = await getAddresses()
      setAddresses(data)
    } catch (err: any) {
      alert(`Error saving address: ${err.message}`)
    } finally {
      setAddressSaving(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    try {
      await deleteAddress(id)
      const data = await getAddresses()
      setAddresses(data)
    } catch (err: any) {
      alert(`Error deleting address: ${err.message}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 flex-grow">
      {/* Welcome & Dashboard Title */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">My Account</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your details, addresses, and history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1 space-y-4">
          {/* User Brief Welcome Card */}
          <div className="flex items-center gap-3 p-4 bg-muted/20 border border-muted/50 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black uppercase text-lg">
              {profile?.full_name?.[0] || user.email?.[0] || 'U'}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Hello,</p>
              <h3 className="text-sm font-extrabold truncate text-foreground">{profile?.full_name || 'Valued Customer'}</h3>
            </div>
          </div>

          {/* Navigation Tab List */}
          <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-2 flex flex-row lg:flex-col overflow-x-auto gap-1 scrollbar-none">
              <button
                onClick={() => handleTabChange('profile')}
                className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all duration-150 ${
                  currentTab === 'profile'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                <User size={16} /> Profile Info
              </button>
              <button
                onClick={() => handleTabChange('addresses')}
                className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all duration-150 ${
                  currentTab === 'addresses'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                <MapPin size={16} /> Manage Addresses
              </button>
              <button
                onClick={() => handleTabChange('orders')}
                className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all duration-150 ${
                  currentTab === 'orders'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                <ShoppingBag size={16} /> Order History
              </button>
              <button
                onClick={() => handleTabChange('wishlist')}
                className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all duration-150 ${
                  currentTab === 'wishlist'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                <Heart size={16} /> My Wishlist
              </button>
              <button
                onClick={() => handleTabChange('seller')}
                className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all duration-150 ${
                  currentTab === 'seller'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                <Landmark size={16} /> Seller Portal
              </button>
              {profile?.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/10 transition-all duration-150 text-left"
                >
                  <LayoutDashboard size={16} /> Admin Panel
                </button>
              )}
              <div className="hidden lg:block border-t border-muted my-2" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10 transition-all duration-150 text-left"
              >
                <LogOut size={16} /> Log Out
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-24 flex items-center justify-center">
              <LoadingSpinner size={32} />
            </div>
          ) : (
            <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl overflow-hidden min-h-[300px]">
              <CardContent className="p-6">
                
                {/* --- TAB: PROFILE INFO --- */}
                {currentTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-muted pb-3">
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <User size={18} className="text-primary" /> Profile Information
                      </h2>
                      {!editProfileMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditProfileMode(true)}
                          className="rounded-full gap-1 text-xs px-3 hover:bg-muted"
                        >
                          <Edit2 size={12} /> Edit
                        </Button>
                      )}
                    </div>

                    {editProfileMode ? (
                      <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                          <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="rounded-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address (Read-only)</label>
                          <Input
                            value={user.email}
                            disabled
                            className="rounded-full bg-muted/30 cursor-not-allowed opacity-80"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number</label>
                          <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 1234567890"
                            className="rounded-full"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setFullName(profile?.full_name || '')
                              setPhone(profile?.phone || '')
                              setEditProfileMode(false)
                            }}
                            className="rounded-full px-6"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={profileSaving} className="rounded-full px-8">
                            {profileSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs max-w-lg leading-relaxed pt-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">Full Name</span>
                          <span className="text-sm font-semibold text-foreground">{profile?.full_name || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">Email Address</span>
                          <span className="text-sm font-semibold text-foreground">{user.email}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">Phone Number</span>
                          <span className="text-sm font-semibold text-foreground">{profile?.phone || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">Account Role</span>
                          <span className="text-xs font-bold uppercase bg-primary/10 text-primary px-3 py-1 rounded-full w-fit block mt-1">
                            {profile?.role || 'Customer'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB: MANAGE ADDRESSES --- */}
                {currentTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-muted pb-3">
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <MapPin size={18} className="text-primary" /> Saved Addresses
                      </h2>
                      {!showAddressForm && (
                        <Button
                          onClick={handleOpenAddAddress}
                          size="sm"
                          className="rounded-full gap-1 text-xs px-4"
                        >
                          <Plus size={14} /> Add New Address
                        </Button>
                      )}
                    </div>

                    {showAddressForm ? (
                      <form onSubmit={handleSaveAddress} className="space-y-4 max-w-lg pt-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {editingAddress ? 'Edit Address' : 'Add New Shipping Address'}
                          </h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowAddressForm(false)}
                            className="rounded-full text-muted-foreground hover:bg-muted"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                            <Input
                              value={addrFullName}
                              onChange={(e) => setAddrFullName(e.target.value)}
                              required
                              className="rounded-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number</label>
                            <Input
                              value={addrPhone}
                              onChange={(e) => setAddrPhone(e.target.value)}
                              required
                              className="rounded-full"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Address Line 1</label>
                            <Input
                              value={addrLine1}
                              onChange={(e) => setAddrLine1(e.target.value)}
                              required
                              className="rounded-full"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Address Line 2 (Optional)</label>
                            <Input
                              value={addrLine2}
                              onChange={(e) => setAddrLine2(e.target.value)}
                              className="rounded-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">City</label>
                            <Input
                              value={addrCity}
                              onChange={(e) => setAddrCity(e.target.value)}
                              required
                              className="rounded-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">State / Province</label>
                            {DEFAULT_STATES[addrCountry] ? (
                              <select
                                value={addrState}
                                onChange={(e) => setAddrState(e.target.value)}
                                required
                                className="w-full bg-background border border-muted text-foreground text-xs rounded-full px-4 h-10 focus:outline-none focus:border-primary"
                              >
                                <option value="">Select State / Province</option>
                                {DEFAULT_STATES[addrCountry].map((s) => (
                                  <option key={s.code} value={s.code}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                value={addrState}
                                onChange={(e) => setAddrState(e.target.value)}
                                required
                                className="rounded-full"
                              />
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Postal / ZIP Code</label>
                            <Input
                              value={addrPostalCode}
                              onChange={(e) => setAddrPostalCode(e.target.value)}
                              required
                              className="rounded-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Country</label>
                            <select
                              value={addrCountry}
                              onChange={(e) => {
                                setAddrCountry(e.target.value)
                                setAddrState('') // Reset state when country changes
                              }}
                              required
                              className="w-full bg-background border border-muted text-foreground text-xs rounded-full px-4 h-10 focus:outline-none focus:border-primary"
                            >
                              <option value="">Select Country</option>
                              {DEFAULT_COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 py-2">
                          <input
                            type="checkbox"
                            id="addrIsDefault"
                            checked={addrIsDefault}
                            onChange={(e) => setAddrIsDefault(e.target.checked)}
                            className="rounded border-muted text-primary"
                          />
                          <label htmlFor="addrIsDefault" className="text-xs text-muted-foreground cursor-pointer select-none">
                            Set as default shipping address
                          </label>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddressForm(false)}
                            className="rounded-full px-6"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addressSaving} className="rounded-full px-8">
                            {addressSaving ? 'Saving...' : (editingAddress ? 'Save Changes' : 'Add Address')}
                          </Button>
                        </div>
                      </form>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-12 border border-muted/50 border-dashed rounded-2xl max-w-sm mx-auto space-y-3">
                        <MapPin className="w-8 h-8 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground italic">No addresses saved yet. Add a shipping address to speed up checkout.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`p-4 border rounded-2xl text-xs space-y-2 flex flex-col justify-between ${
                              addr.is_default ? 'bg-primary/5 border-primary/20' : 'bg-muted/10 border-muted'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-sm text-foreground">{addr.full_name}</span>
                                {addr.is_default && (
                                  <span className="text-[9px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground">{addr.phone}</p>
                              <p className="text-muted-foreground mt-1.5 leading-relaxed">
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ''}
                                <br />
                                {addr.city}, {DEFAULT_STATES[addr.country]?.find(s => s.code === addr.state)?.name || addr.state} {addr.postal_code}
                                <br />
                                {DEFAULT_COUNTRIES.find(c => c.code === addr.country)?.name || addr.country}
                              </p>
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-muted/50 mt-3 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditAddress(addr)}
                                className="rounded-full text-xs hover:bg-muted text-muted-foreground hover:text-foreground px-3 gap-1"
                              >
                                <Edit2 size={12} /> Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="rounded-full text-xs hover:bg-destructive/10 text-muted-foreground hover:text-destructive px-3 gap-1"
                              >
                                <Trash2 size={12} /> Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB: ORDER HISTORY --- */}
                {currentTab === 'orders' && (
                  <div className="space-y-6">
                    <div className="border-b border-muted pb-3">
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <ShoppingBag size={18} className="text-primary" /> Order History
                      </h2>
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center py-12 border border-muted/50 border-dashed rounded-2xl max-w-sm mx-auto space-y-3">
                        <Package className="w-8 h-8 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground italic">You haven&apos;t placed any orders yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="border border-muted rounded-2xl overflow-hidden text-xs bg-muted/10"
                          >
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row justify-between gap-3 p-4 bg-muted/20 border-b border-muted">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Order Placed</span>
                                  <span className="font-semibold text-foreground">{formatDate(order.created_at)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Total Amount</span>
                                  <span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Order ID</span>
                                  <span className="font-mono text-muted-foreground">{order.id}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Payment</span>
                                  <span className={`font-bold capitalize ${
                                    order.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'
                                  }`}>{order.payment_status}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-start sm:self-center">
                                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${
                                  order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                  order.status === 'cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                  order.status === 'returned' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-4 divide-y divide-muted/50 space-y-3">
                              {order.items?.map((item: any, idx: number) => {
                                const snapshot = item.productSnapshot || {}
                                return (
                                  <div key={idx} className="flex gap-4 pt-3 first:pt-0 items-center">
                                    <div className="w-14 h-14 bg-muted rounded-xl overflow-hidden flex-shrink-0 border border-muted">
                                      <img src={snapshot.image || 'https://via.placeholder.com/150'} alt={snapshot.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-extrabold text-sm text-foreground truncate">{snapshot.name}</p>
                                      <p className="text-muted-foreground mt-0.5">
                                        Qty: {item.quantity} {snapshot.variantName ? `| ${snapshot.variantName}` : ''}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-foreground">{formatCurrency(item.unitPrice)}</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Order Footer Actions */}
                            <div className="flex flex-wrap items-center justify-end gap-2 p-3 bg-muted/5 border-t border-muted/50">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="rounded-full text-[10px] uppercase font-bold tracking-wider px-4 gap-1.5 h-8 border-muted hover:bg-muted/50"
                              >
                                <FileText size={12} className="text-primary" /> Invoice
                              </Button>

                              {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="rounded-full text-[10px] uppercase font-bold tracking-wider px-4 gap-1.5 h-8 border-destructive/30 hover:bg-destructive/10 text-destructive"
                                >
                                  <Ban size={12} /> Cancel Order
                                </Button>
                              )}

                              {order.status === 'delivered' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedReturnOrder(order)}
                                  className="rounded-full text-[10px] uppercase font-bold tracking-wider px-4 gap-1.5 h-8 border-primary/30 hover:bg-primary/10 text-primary"
                                >
                                  <Undo2 size={12} /> Return Items
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB: WISHLIST --- */}
                {currentTab === 'wishlist' && (
                  <div className="space-y-6">
                    <div className="border-b border-muted pb-3">
                      <h2 className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <Heart size={18} className="text-rose-500" /> My Wishlist ({wishlistProducts.length})
                      </h2>
                    </div>

                    {wishlistHookLoading ? (
                      <div className="py-12 flex justify-center">
                        <LoadingSpinner size={24} />
                      </div>
                    ) : wishlistProducts.length === 0 ? (
                      <div className="text-center py-12 border border-muted/50 border-dashed rounded-2xl max-w-sm mx-auto space-y-3">
                        <Heart className="w-8 h-8 text-rose-500 mx-auto" />
                        <p className="text-xs text-muted-foreground italic">Your wishlist is currently empty. Bookmark items to view them here.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                        {wishlistProducts.map((prod) => (
                          <ProductCard key={prod.id} product={prod} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- TAB: SELLER PORTAL --- */}
                {currentTab === 'seller' && (
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-muted pb-4 gap-4">
                      <div>
                        <h2 className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                          <Landmark size={18} className="text-primary" /> Marketplace Seller Dashboard
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Track your shop metrics and list products for sale.</p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Shop Status: Active
                      </span>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-5 bg-muted/15 border border-muted/50 rounded-2xl">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-0.5">Total Sales Revenue</span>
                        <span className="text-xl font-black text-foreground">{formatCurrency(284500)}</span>
                        <span className="text-[10px] text-emerald-500 font-bold block mt-1.5">↑ 12.4% vs last month</span>
                      </div>
                      <div className="p-5 bg-muted/15 border border-muted/50 rounded-2xl">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-0.5">Active Marketplace Listings</span>
                        <span className="text-xl font-black text-foreground">{sellerProducts.length}</span>
                        <span className="text-[10px] text-muted-foreground block mt-1.5">All products active on EliteCart</span>
                      </div>
                      <div className="p-5 bg-muted/15 border border-muted/50 rounded-2xl">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-0.5">Incoming Orders</span>
                        <span className="text-xl font-black text-foreground">42</span>
                        <span className="text-[10px] text-emerald-500 font-bold block mt-1.5">4 orders pending dispatch</span>
                      </div>
                    </div>

                    {/* Sales Performance Chart */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Sales Curve</h3>
                      <div className="w-full h-64 bg-muted/5 border border-muted/30 rounded-2xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.01}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '11px' }}
                              itemStyle={{ color: 'hsl(var(--primary))', fontSize: '11px' }}
                            />
                            <Area type="monotone" dataKey="Sales" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Grid: Listing Form & Active Listings */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* Form: Add Product */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted pb-2 text-left">
                          List a New Product
                        </h3>
                        <form onSubmit={handleCreateSellerProduct} className="space-y-3 bg-muted/10 p-5 rounded-2xl border border-muted/40">
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Product Name</label>
                            <Input
                              value={sellerProdName}
                              onChange={(e) => setSellerProdName(e.target.value)}
                              placeholder="e.g. Mechanical Keyboard Pro"
                              required
                              className="rounded-full h-9 text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 text-left">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase">Listing Price</label>
                              <Input
                                type="number"
                                value={sellerProdPrice}
                                onChange={(e) => setSellerProdPrice(e.target.value)}
                                placeholder="e.g. 45"
                                required
                                className="rounded-full h-9 text-xs"
                              />
                            </div>
                            <div className="space-y-1 text-left">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase">Stock Qty</label>
                              <Input
                                type="number"
                                value={sellerProdStock}
                                onChange={(e) => setSellerProdStock(e.target.value)}
                                placeholder="e.g. 15"
                                required
                                className="rounded-full h-9 text-xs"
                              />
                            </div>
                          </div>
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Brand Name</label>
                            <Input
                              value={sellerProdBrand}
                              onChange={(e) => setSellerProdBrand(e.target.value)}
                              placeholder="e.g. Razer"
                              required
                              className="rounded-full h-9 text-xs"
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Product Description</label>
                            <textarea
                              value={sellerProdDesc}
                              onChange={(e) => setSellerProdDesc(e.target.value)}
                              placeholder="Describe your item specs..."
                              required
                              className="w-full bg-background border border-muted text-foreground text-xs rounded-2xl p-3 h-20 focus:outline-none focus:border-primary resize-none"
                            />
                          </div>
                          <Button type="submit" disabled={sellerSaving} className="w-full rounded-full h-9 mt-2 text-xs font-bold uppercase tracking-wider">
                            {sellerSaving ? 'Creating Listing...' : 'Submit Shop Listing'}
                          </Button>
                        </form>
                      </div>

                      {/* List: Active Listings */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-muted pb-2 text-left">
                          Your Active Listings
                        </h3>
                        <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                          {sellerProducts.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-12 text-center border border-dashed border-muted rounded-2xl">
                              No shop listings yet. Use the form to list your first item!
                            </p>
                          ) : (
                            sellerProducts.map((p: any) => (
                              <div key={p.id} className="flex gap-3 p-3 bg-muted/15 border border-muted/30 rounded-2xl items-center text-xs">
                                <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden flex-shrink-0 border border-muted">
                                  <img src={p.images?.[0] || 'https://via.placeholder.com/150'} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <h4 className="font-extrabold text-foreground truncate">{p.name}</h4>
                                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">SKU: {p.sku}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-primary">{formatCurrency(p.price)}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">Stock: {p.stock_quantity}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* --- MODAL: PRINTABLE INVOICE --- */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in print:bg-white print:p-0 print:static print:inset-auto print:z-auto">
          <div className="relative w-full max-w-3xl bg-card border border-muted/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:border-none print:shadow-none print:rounded-none print:max-h-none print:w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-muted print:hidden">
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <FileText className="text-primary" size={16} /> Tax Invoice / Receipt
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  size="sm"
                  className="rounded-full text-[10px] uppercase font-bold tracking-wider px-4 gap-1.5"
                >
                  Print Invoice
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Modal Body / Invoice Content */}
            <div id="invoice-print-area" className="flex-1 overflow-y-auto p-8 space-y-8 text-xs leading-relaxed text-foreground print:overflow-visible print:p-0">
              {/* Brand Logo and Invoice Metadata */}
              <div className="flex justify-between items-start">
                <div className="space-y-1 text-left">
                  <h1 className="text-xl font-black tracking-tight text-primary">ELITECART</h1>
                  <p className="text-[10px] text-muted-foreground">Marketplace Premium E-Commerce</p>
                </div>
                <div className="text-right space-y-0.5">
                  <h3 className="text-sm font-extrabold uppercase text-foreground">INVOICE</h3>
                  <p className="font-mono text-muted-foreground text-[10px]">Invoice No: INV-{selectedInvoiceOrder.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-muted-foreground">Date: {formatDate(selectedInvoiceOrder.created_at)}</p>
                </div>
              </div>

              <div className="border-t border-muted/60" />

              {/* Vendor & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5 text-left">
                  <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Sold By:</h4>
                  <p className="font-semibold text-foreground">EliteCart Retail Pvt Ltd</p>
                  <p className="text-muted-foreground">
                    102, Tech City Tower B,<br />
                    Outer Ring Road, Bangalore,<br />
                    Karnataka, 560103, India
                  </p>
                </div>
                <div className="space-y-1.5 text-left">
                  <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Shipping Address:</h4>
                  <p className="font-semibold text-foreground">{selectedInvoiceOrder.shipping_address?.fullName || selectedInvoiceOrder.shipping_address?.full_name || 'Valued Customer'}</p>
                  <p className="text-muted-foreground">
                    {selectedInvoiceOrder.shipping_address?.line1 || selectedInvoiceOrder.shipping_address?.addressLine1}
                    {(selectedInvoiceOrder.shipping_address?.line2 || selectedInvoiceOrder.shipping_address?.addressLine2) ? `, ${selectedInvoiceOrder.shipping_address?.line2 || selectedInvoiceOrder.shipping_address?.addressLine2}` : ''}
                    <br />
                    {selectedInvoiceOrder.shipping_address?.city}, {selectedInvoiceOrder.shipping_address?.state} {selectedInvoiceOrder.shipping_address?.postalCode || selectedInvoiceOrder.shipping_address?.postal_code || selectedInvoiceOrder.shipping_address?.zipCode}
                    <br />
                    {selectedInvoiceOrder.shipping_address?.country || 'India'}
                  </p>
                  <p className="text-muted-foreground">Phone: {selectedInvoiceOrder.shipping_address?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-muted/50 rounded-2xl overflow-hidden bg-muted/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/15 border-b border-muted/50 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      <th className="p-4">Description</th>
                      <th className="p-4 text-center">Qty</th>
                      <th className="p-4 text-right">Unit Price</th>
                      <th className="p-4 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/30">
                    {selectedInvoiceOrder.items?.map((item: any, idx: number) => {
                      const snap = item.productSnapshot || {}
                      return (
                        <tr key={idx} className="hover:bg-muted/5">
                          <td className="p-4 text-left">
                            <span className="font-bold text-foreground block">{snap.name}</span>
                            {snap.variantName && <span className="text-[10px] text-muted-foreground block mt-0.5">Variant: {snap.variantName}</span>}
                          </td>
                          <td className="p-4 text-center font-semibold text-foreground">{item.quantity}</td>
                          <td className="p-4 text-right text-foreground">{formatCurrency(item.unitPrice)}</td>
                          <td className="p-4 text-right font-semibold text-foreground">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Calculations Block */}
              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-2 text-right">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(selectedInvoiceOrder.subtotal || selectedInvoiceOrder.total)}</span>
                  </div>
                  {selectedInvoiceOrder.shipping > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping Charges:</span>
                      <span className="font-semibold text-foreground">{formatCurrency(selectedInvoiceOrder.shipping)}</span>
                    </div>
                  )}
                  {selectedInvoiceOrder.tax > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST / Taxes (18%):</span>
                      <span className="font-semibold text-foreground">{formatCurrency(selectedInvoiceOrder.tax)}</span>
                    </div>
                  )}
                  {selectedInvoiceOrder.discount > 0 && (
                    <div className="flex justify-between text-rose-500">
                      <span>Coupon Discount:</span>
                      <span>-{formatCurrency(selectedInvoiceOrder.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-muted/60 my-2 pt-2 flex justify-between text-sm font-extrabold text-foreground">
                    <span>Grand Total:</span>
                    <span className="text-primary">{formatCurrency(selectedInvoiceOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-muted/60" />

              {/* Legal Declarations */}
              <div className="space-y-1 text-[10px] text-muted-foreground text-left">
                <p className="font-bold uppercase text-foreground">Declaration:</p>
                <p>This is a computer generated document and does not require a physical signature. All disputes are subject to Bangalore jurisdiction only.</p>
                <p>Thank you for shopping with EliteCart! For any support regarding this order, please contact support@elitecart.com.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: RETURN REQUEST --- */}
      {selectedReturnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-card border border-muted/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-muted">
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Undo2 className="text-primary" size={16} /> Return Request
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedReturnOrder(null)
                  setReturnReason('')
                }}
                className="rounded-full text-muted-foreground hover:bg-muted"
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
              <div className="space-y-1 text-left">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You are initiating a return for Order <strong className="font-mono text-foreground">#{selectedReturnOrder.id.slice(0, 8).toUpperCase()}</strong>. Please provide details regarding the return.
                </p>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required
                  className="w-full bg-background border border-muted text-foreground text-xs rounded-xl px-4 h-11 focus:outline-none focus:border-primary"
                >
                  <option value="">Select a reason</option>
                  <option value="damaged">Product arrived damaged or defective</option>
                  <option value="wrong_item">Received the wrong item or variant</option>
                  <option value="unsatisfied">Product quality not as expected</option>
                  <option value="size_issue">Size does not fit correctly</option>
                  <option value="no_longer_needed">No longer needed / changed mind</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedReturnOrder(null)
                    setReturnReason('')
                  }}
                  className="rounded-full px-5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full px-6 text-xs"
                >
                  Submit Return Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AccountDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center p-12">
        <LoadingSpinner size={32} />
      </div>
    }>
      <AccountDashboardContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
