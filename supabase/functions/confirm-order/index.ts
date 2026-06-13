import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any
      const paymentIntentId = paymentIntent.id

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .single()

      if (!orderError && order) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed'
          })
          .eq('id', order.id)

        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, variant_id, quantity')
          .eq('order_id', order.id)

        if (items) {
          for (const item of items) {
            if (item.variant_id) {
              const { data: variant } = await supabase
                .from('product_variants')
                .select('stock_quantity')
                .eq('id', item.variant_id)
                .single()
              if (variant) {
                await supabase
                  .from('product_variants')
                  .update({ stock_quantity: Math.max(0, variant.stock_quantity - item.quantity) })
                  .eq('id', item.variant_id)
              }
            } else {
              const { data: product } = await supabase
                .from('products')
                .select('stock_quantity')
                .eq('id', item.product_id)
                .single()
              if (product) {
                await supabase
                  .from('products')
                  .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
                  .eq('id', item.product_id)
              }
            }
          }
        }

        await supabase.functions.invoke('send-order-email', {
          body: { orderId: order.id, email: paymentIntent.receipt_email || order.shipping_address.email }
        })
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return new Response(`Error: ${error.message}`, { status: 400 })
  }
})
