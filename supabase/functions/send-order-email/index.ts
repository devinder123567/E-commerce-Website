import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  const { orderId } = await req.json()
  if (!orderId) {
    return new Response('Missing orderId', { status: 400 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .eq('id', orderId)
      .single()

    if (error || !order) {
      throw new Error('Order not found')
    }

    const emailTo = (order.shipping_address as any).email || 'customer@example.com'
    const customerName = (order.profiles as any)?.full_name || (order.shipping_address as any).fullName

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'DEVI Shop <orders@devi-ecommerce.com>',
        to: [emailTo],
        subject: `Your DEVI Order #${order.id.slice(0, 8)} is Confirmed!`,
        html: `
          <h1>Thank you for your order, ${customerName}!</h1>
          <p>We've received your payment and are preparing your package.</p>
          <h3>Order Details:</h3>
          <ul>
            <li>Order ID: #${order.id}</li>
            <li>Total Paid: $${order.total}</li>
          </ul>
          <p>We'll notify you as soon as your items are shipped.</p>
        `
      })
    })

    const result = await res.json()
    return new Response(JSON.stringify(result), { status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
