'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/lib/hooks/useViteNavigation'
import { useCart } from '@/lib/hooks/useCart'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/authStore'
import { useCartStore } from '@/lib/store/cartStore'
import { createOrder } from '@/actions/orders'
import { getAddresses, createAddress } from '@/actions/addresses'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ChevronRight, CreditCard, ShieldCheck, Smartphone, Landmark } from 'lucide-react'
import { DEFAULT_COUNTRIES, DEFAULT_STATES } from '@/lib/constants/countries'
import { loadStripe } from '@stripe/stripe-js'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe((import.meta as any).env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface Address {
  id: string
  full_name: string
  phone: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export function CheckoutForm() {
  const router = useRouter()
  const supabase = createClient() as any
  const { user } = useAuthStore()
  const { items, coupon, clearCart } = useCart()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('US')
  const [saveAddress, setSaveAddress] = useState(true)

  const [deliveryMethod, setDeliveryMethod] = useState<'cod' | 'pay_now' | 'razorpay'>('razorpay')
  const [clientSecret, setClientSecret] = useState('')

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = coupon
    ? Math.min(coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value, subtotal)
    : 0
  const tax = (subtotal - discount) * 0.08
  const shipping = subtotal - discount > 150 ? 0 : 15
  const total = subtotal - discount + tax + shipping

  useEffect(() => {
    async function load() {
      if (!user) return
      const data = await getAddresses()
      if (data) {
        setSavedAddresses(data)
        const def = data.find((a: any) => a.is_default) || data[0]
        if (def) {
          selectAddress(def)
        }
      }
    }
    load()
  }, [user])

  const selectAddress = (addr: Address) => {
    setFullName(addr.full_name)
    setPhone(addr.phone)
    setLine1(addr.line1)
    setLine2(addr.line2 || '')
    setCity(addr.city)
    setState(addr.state)
    setPostalCode(addr.postal_code)
    setCountry(addr.country)
  }

  const handleNextStep1 = () => {
    if (!fullName || !phone || !line1 || !city || !state || !postalCode || !country) {
      alert('Please fill in all shipping fields.')
      return
    }
    setStep(2)
  }

  const completeOrderWithoutPayment = async () => {
    setLoading(true)
    try {
      if (saveAddress && user) {
        await createAddress({
          full_name: fullName,
          phone: phone,
          line1: line1,
          line2: line2 || null,
          city: city,
          state: state,
          postal_code: postalCode,
          country: country,
          is_default: false
        })
      }

      const orderItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        productSnapshot: { name: item.name, image: item.image, variantName: item.variantName || null }
      }))

      const order = await createOrder({
        subtotal,
        tax,
        shipping,
        discount,
        total,
        shippingAddress: {
          fullName,
          phone,
          line1,
          line2: line2 || null,
          city,
          state,
          postalCode,
          country
        },
        items: orderItems
      })

      if (isSupabasePlaceholder()) {
        const list = JSON.parse(localStorage.getItem('devi_mock_orders') || '[]')
        const idx = list.findIndex((o: any) => o.id === order.id)
        if (idx > -1) {
          list[idx].payment_status = 'pending'
          list[idx].status = 'confirmed'
          list[idx].payment_intent_id = 'COD'
          localStorage.setItem('devi_mock_orders', JSON.stringify(list))
        }
      } else {
        await supabase
          .from('orders')
          .update({
            payment_status: 'pending',
            status: 'confirmed',
            payment_intent_id: 'COD'
          })
          .eq('id', order.id)
      }

      clearCart()
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to place order.')
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep2 = async () => {
    if (deliveryMethod === 'cod') {
      await completeOrderWithoutPayment()
      return
    }

    if (deliveryMethod === 'pay_now') {
      setLoading(true)
      try {
        let clientSecret = ''

        if (isSupabasePlaceholder()) {
          const secretKey = (import.meta as any).env.VITE_STRIPE_SECRET_KEY || 'sk_test_4eC39HqLyjWDarjtt1zdp7dc'
          const response = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              amount: Math.round(total * 100).toString(),
              currency: 'usd',
              description: `EliteCart order by ${user?.email || 'guest'}`
            })
          })
          const data = await response.json()
          if (data.error) {
            throw new Error(data.error.message)
          }
          clientSecret = data.client_secret
        } else {
          const { data, error } = await supabase.functions.invoke('create-payment-intent', {
            body: {
              amount: Math.round(total * 100),
              currency: 'usd',
              metadata: { userId: user?.id, couponCode: coupon?.code }
            }
          })

          if (error || !data?.clientSecret) {
            console.error('Payment intent error:', error)
            alert('Failed to initialize payment gateway.')
            return
          }
          clientSecret = data.clientSecret
        }

        setClientSecret(clientSecret)
        setStep(3)
      } catch (err: any) {
        console.error(err)
        alert(err.message || 'Failed to initialize payment gateway.')
      } finally {
        setLoading(false)
      }
    } else {
      setStep(3)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between border border-muted/50 p-4 rounded-2xl bg-muted/10 text-xs font-semibold uppercase tracking-wider">
          <span className={step === 1 ? 'text-primary font-bold' : 'text-muted-foreground'}>1. Shipping</span>
          <ChevronRight size={14} className="text-muted-foreground" />
          <span className={step === 2 ? 'text-primary font-bold' : 'text-muted-foreground'}>2. Delivery</span>
          <ChevronRight size={14} className="text-muted-foreground" />
          <span className={step === 3 ? 'text-primary font-bold' : 'text-muted-foreground'}>3. Payment</span>
        </div>

        {step === 1 && (
          <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-foreground">Shipping Address</h3>

              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Saved Addresses</label>
                  <div className="grid grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => selectAddress(addr)}
                        className="text-left p-3 text-xs bg-muted/30 border border-muted hover:border-primary rounded-xl"
                      >
                        <p className="font-bold">{addr.full_name}</p>
                        <p className="truncate mt-0.5">{addr.line1}, {addr.city}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="rounded-full border-muted" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} required className="rounded-full border-muted" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Address Line 1</label>
                  <Input value={line1} onChange={(e) => setLine1(e.target.value)} required className="rounded-full border-muted" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Address Line 2 (Optional)</label>
                  <Input value={line2} onChange={(e) => setLine2(e.target.value)} className="rounded-full border-muted" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">City</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} required className="rounded-full border-muted" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">State / Province</label>
                  {DEFAULT_STATES[country] ? (
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="w-full bg-background border border-muted text-foreground text-xs rounded-full px-4 h-10 focus:outline-none focus:border-primary"
                    >
                      <option value="">Select State / Province</option>
                      {DEFAULT_STATES[country].map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input value={state} onChange={(e) => setState(e.target.value)} required className="rounded-full border-muted" />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Postal / ZIP Code</label>
                  <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className="rounded-full border-muted" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Country</label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value)
                      setState('') // Reset state when country changes
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

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="saveAddress"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="rounded border-muted text-primary focus:ring-primary"
                />
                <label htmlFor="saveAddress" className="text-xs text-muted-foreground cursor-pointer select-none">
                  Save this address to my profile
                </label>
              </div>

              <Button onClick={handleNextStep1} className="w-full rounded-full font-bold">
                Continue to Delivery
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-foreground">Delivery & Payment Method</h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-muted/20 border border-muted hover:border-primary rounded-2xl cursor-pointer select-none">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'razorpay'}
                      onChange={() => setDeliveryMethod('razorpay')}
                      className="text-primary focus:ring-primary"
                    />
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-primary animate-pulse" />
                      <div>
                        <p className="text-sm font-bold text-foreground">Razorpay Payment Gateway</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pay securely in real-time via UPI (GPay, PhonePe, Paytm), Netbanking, Wallets, and Cards.</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-muted/20 border border-muted hover:border-primary rounded-2xl cursor-pointer select-none">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'pay_now'}
                      onChange={() => setDeliveryMethod('pay_now')}
                      className="text-primary focus:ring-primary"
                    />
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-bold">Credit / Debit Cards (Stripe)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pay securely online using international cards.</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 bg-muted/20 border border-muted hover:border-primary rounded-2xl cursor-pointer select-none">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'cod'}
                      onChange={() => setDeliveryMethod('cod')}
                      className="text-primary focus:ring-primary"
                    />
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-bold">Cash on Delivery (COD)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pay cash at your doorstep upon receiving the items.</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-full px-6 border-muted">
                  Back
                </Button>
                <Button onClick={handleNextStep2} disabled={loading} className="rounded-full flex-grow font-bold">
                  {loading ? 'Processing...' : (deliveryMethod === 'cod' ? 'Confirm Order' : 'Continue to Payment')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && deliveryMethod === 'pay_now' && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <StripePaymentForm
              address={{ fullName, phone, line1, line2, city, state, postalCode, country, saveAddress }}
              pricing={{ subtotal, tax, shipping, discount, total }}
              clearCart={clearCart}
            />
          </Elements>
        )}

        {step === 3 && deliveryMethod === 'razorpay' && (
          <RazorpayPaymentForm
            address={{ fullName, phone, line1, line2, city, state, postalCode, country, saveAddress }}
            pricing={{ subtotal, tax, shipping, discount, total }}
            clearCart={clearCart}
            setStep={setStep}
          />
        )}
      </div>

      <div className="p-5 border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl space-y-4 h-fit">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Order Summary</h3>

        <div className="divide-y divide-muted space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
              <div className="relative w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-bold truncate">{item.name}</p>
                <p className="text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                <p className="text-primary font-semibold mt-0.5">{formatCurrency(item.price)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-muted pt-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
          </div>
          {coupon && (
            <div className="flex justify-between text-primary font-bold">
              <span>Promo ({coupon.code})</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="border-t border-muted pt-3 flex justify-between text-sm font-bold text-foreground">
            <span>Total</span>
            <span className="text-base text-primary font-black">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StripePaymentForm({ address, pricing, clearCart }: { address: any; pricing: any; clearCart: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const supabase = createClient() as any
  const { user } = useAuthStore()

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setSubmitting(true)
    setErrorMsg('')

    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (paymentError) {
      setErrorMsg(paymentError.message || 'Payment processing failed.')
      setSubmitting(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        if (address.saveAddress && user) {
          await createAddress({
            full_name: address.fullName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 || null,
            city: address.city,
            state: address.state,
            postal_code: address.postalCode,
            country: address.country,
            is_default: false
          })
        }

        const { items } = useCartStore.getState()
        const orderItems = items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          productSnapshot: { name: item.name, image: item.image, variantName: item.variantName || null }
        }))

        const order = await createOrder({
          subtotal: pricing.subtotal,
          tax: pricing.tax,
          shipping: pricing.shipping,
          discount: pricing.discount,
          total: pricing.total,
          shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 || null,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country
          },
          items: orderItems
        })

        if (isSupabasePlaceholder()) {
          const list = JSON.parse(localStorage.getItem('devi_mock_orders') || '[]')
          const idx = list.findIndex((o: any) => o.id === order.id)
          if (idx > -1) {
            list[idx].payment_status = 'paid'
            list[idx].status = 'confirmed'
            list[idx].payment_intent_id = paymentIntent.id
            localStorage.setItem('devi_mock_orders', JSON.stringify(list))
          }
        } else {
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              payment_intent_id: paymentIntent.id
            })
            .eq('id', order.id)
        }

        clearCart()
        router.push(`/checkout/success?orderId=${order.id}`)
      } catch (err: any) {
        console.error(err)
        setErrorMsg(err.message || 'Order completion failed.')
        setSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handlePaymentSubmit} className="space-y-6">
      <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Secure Card Payment</h3>
          </div>

          <PaymentElement />

          {errorMsg && (
            <p className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Encrypted payment connection. Powered by Stripe.</span>
          </div>

          <Button type="submit" disabled={submitting || !stripe} className="w-full rounded-full font-bold uppercase text-xs tracking-wider">
            {submitting ? 'Processing...' : `Pay ${formatCurrency(pricing.total)}`}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

function RazorpayPaymentForm({ address, pricing, clearCart, setStep }: { address: any; pricing: any; clearCart: () => void; setStep: any }) {
  const router = useRouter()
  const supabase = createClient() as any
  const { user } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    // Load script dynamically
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => setErrorMsg('Failed to load Razorpay SDK. Check your internet connection.')
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleRazorpayPayment = async () => {
    if (!scriptLoaded) {
      alert('Razorpay SDK is still loading. Please wait...')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    const inrRate = 83
    const totalInINR = pricing.total * inrRate
    const totalInPaise = Math.round(totalInINR * 100)

    const options = {
      key: 'rzp_test_Rp7Q0snFBZKQb0',
      amount: totalInPaise,
      currency: 'INR',
      name: 'EliteCart',
      description: 'EliteCart Order Checkout Payment',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=100&auto=format&fit=crop',
      handler: async function (response: any) {
        try {
          const paymentId = response.razorpay_payment_id
          if (!paymentId) {
            throw new Error('Payment verification failed.')
          }

          if (address.saveAddress && user) {
            await createAddress({
              full_name: address.fullName,
              phone: address.phone,
              line1: address.line1,
              line2: address.line2 || null,
              city: address.city,
              state: address.state,
              postal_code: address.postalCode,
              country: address.country,
              is_default: false
            })
          }

          const { items } = useCartStore.getState()
          const orderItems = items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            productSnapshot: { name: item.name, image: item.image, variantName: item.variantName || null }
          }))

          const order = await createOrder({
            subtotal: pricing.subtotal,
            tax: pricing.tax,
            shipping: pricing.shipping,
            discount: pricing.discount,
            total: pricing.total,
            shippingAddress: {
              fullName: address.fullName,
              phone: address.phone,
              line1: address.line1,
              line2: address.line2 || null,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country
            },
            items: orderItems
          })

          if (isSupabasePlaceholder()) {
            const list = JSON.parse(localStorage.getItem('devi_mock_orders') || '[]')
            const idx = list.findIndex((o: any) => o.id === order.id)
            if (idx > -1) {
              list[idx].payment_status = 'paid'
              list[idx].status = 'confirmed'
              list[idx].payment_intent_id = paymentId
              localStorage.setItem('devi_mock_orders', JSON.stringify(list))
            }
          } else {
            await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                status: 'confirmed',
                payment_intent_id: paymentId
              })
              .eq('id', order.id)
          }

          clearCart()
          router.push(`/checkout/success?orderId=${order.id}`)
        } catch (err: any) {
          console.error(err)
          setErrorMsg(err.message || 'Failed to complete order after payment.')
          setSubmitting(false)
        }
      },
      prefill: {
        name: address.fullName,
        contact: address.phone,
        email: user?.email || ''
      },
      theme: {
        color: '#8b5cf6'
      },
      modal: {
        ondismiss: function () {
          setSubmitting(false)
        }
      }
    }

    try {
      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (resp: any) {
        setErrorMsg(`Payment failed: ${resp.error.description || resp.error.reason}`)
        setSubmitting(false)
      })
      rzp.open()
    } catch (err: any) {
      setErrorMsg('Failed to open Razorpay payment modal. Please try again.')
      setSubmitting(false)
    }
  }

  const inrRate = 83
  const totalInINR = pricing.total * inrRate

  return (
    <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-muted">
          <Smartphone className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Razorpay Secure Checkout</h3>
        </div>

        <div className="bg-muted/15 border border-muted p-4 rounded-xl space-y-3 text-xs leading-relaxed">
          <div className="flex justify-between items-center text-muted-foreground font-semibold">
            <span>Order Value (USD)</span>
            <span className="text-foreground font-bold">${pricing.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground font-semibold">
            <span>INR Exchange Rate</span>
            <span className="text-foreground">1 USD = ₹{inrRate}.00</span>
          </div>
          <div className="flex justify-between items-center border-t border-muted pt-3 font-bold text-sm">
            <span className="text-foreground">Total in INR</span>
            <span className="text-primary font-black">₹{totalInINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
            {errorMsg}
          </p>
        )}

        <div className="flex gap-3 pt-3 border-t border-muted/50">
          <Button type="button" variant="outline" onClick={() => setStep(2)} className="rounded-full px-6 border-muted text-xs font-bold uppercase tracking-wider">
            Back
          </Button>
          <Button
            type="button"
            onClick={handleRazorpayPayment}
            disabled={submitting || !scriptLoaded}
            className="rounded-full flex-grow font-bold uppercase text-xs tracking-wider"
          >
            {submitting ? 'Processing Payment...' : `Pay ₹${totalInINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })} via Razorpay`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
