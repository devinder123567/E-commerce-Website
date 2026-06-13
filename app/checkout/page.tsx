import { CheckoutForm } from '@/components/checkout/CheckoutForm'

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6">
      <h1 className="text-3xl font-black uppercase tracking-tight">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}
