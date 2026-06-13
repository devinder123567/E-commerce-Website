import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'
import { isSupabasePlaceholder, mockDb } from '@/lib/supabase/mockDb'

const OrderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().nullable(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  productSnapshot: z.any()
})

const CreateOrderSchema = z.object({
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().nonnegative(),
  shippingAddress: z.any(),
  notes: z.string().optional(),
  items: z.array(OrderItemSchema)
})

export async function createOrder(data: z.infer<typeof CreateOrderSchema>) {
  if (isSupabasePlaceholder()) {
    const mockSessionStr = localStorage.getItem('devi-mock-session')
    const user = mockSessionStr ? JSON.parse(mockSessionStr).user : null
    const payload = {
      ...data,
      user_id: user ? user.id : '00000000-0000-0000-0000-000000000000'
    }
    
    if (user) {
      let mockCarts = JSON.parse(localStorage.getItem('devi_mock_cart_items') || '[]')
      mockCarts = mockCarts.filter((ci: any) => ci.user_id !== user.id)
      localStorage.setItem('devi_mock_cart_items', JSON.stringify(mockCarts))
    }

    return mockDb.createOrder(payload)
  }

  const supabase = createClient() as any
  const validated = CreateOrderSchema.parse(data)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      subtotal: validated.subtotal,
      tax: validated.tax,
      shipping: validated.shipping,
      discount: validated.discount,
      total: validated.total,
      shipping_address: validated.shippingAddress,
      notes: validated.notes || null,
      status: 'pending',
      payment_status: 'pending'
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('Error creating order:', orderError)
    throw new Error('Failed to create order')
  }

  // Insert order items
  const orderItemsData = validated.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
    product_snapshot: item.productSnapshot
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData)

  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Failed to create order details')
  }

  // Empty user's cart in database upon order creation
  await supabase.from('cart_items').delete().eq('user_id', user.id)

  return order
}

export async function getOrderById(orderId: string) {
  if (isSupabasePlaceholder()) {
    return mockDb.getOrderById(orderId)
  }

  const supabase = createClient() as any
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          slug,
          images
        )
      )
    `)
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return order
}

export async function getUserOrders() {
  if (isSupabasePlaceholder()) {
    const mockSessionStr = localStorage.getItem('devi-mock-session')
    const userId = mockSessionStr ? JSON.parse(mockSessionStr).user?.id : '00000000-0000-0000-0000-000000000000'
    return mockDb.getUserOrders(userId)
  }

  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user orders:', error)
    return []
  }

  return data
}

export async function updateOrderStatus(orderId: string, status: string, returnReason?: string) {
  if (isSupabasePlaceholder()) {
    return mockDb.updateOrderStatus(orderId, status, returnReason)
  }

  const supabase = createClient() as any
  const updateData: any = { status }
  if (returnReason) {
    updateData.notes = `Return Reason: ${returnReason}`
  }
  
  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error)
    throw new Error('Failed to update order status')
  }

  return { success: true }
}
