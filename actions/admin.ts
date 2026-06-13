import { createClient } from '@/lib/supabase/client'
const revalidatePath = (path: string) => {}
import { z } from 'zod'
import { isSupabasePlaceholder, mockDb } from '@/lib/supabase/mockDb'

// Helper function to verify admin user role
async function verifyAdmin(supabase: any) {
  // Bypassed if using mock Db
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return user
}

// Product Schema
const ProductFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().default(''),
  price: z.number().positive('Price must be greater than zero'),
  compare_price: z.number().nullable().optional(),
  cost_price: z.number().nullable().optional(),
  sku: z.string().min(1, 'SKU is required'),
  stock_quantity: z.number().int().nonnegative('Stock cannot be negative'),
  category_id: z.string().uuid().nullable().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  weight: z.number().default(0),
  variants: z.array(z.object({
    name: z.string(),
    price: z.number(),
    stock_quantity: z.number().int().nonnegative(),
    sku: z.string()
  })).default([])
})

// Dashboard Analytics
export async function getDashboardStats() {
  if (isSupabasePlaceholder()) {
    return mockDb.getDashboardStats()
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total, payment_status, status')

  const { count: customersCount, error: customerError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: productsCount, error: productError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  if (ordersError || customerError || productError) {
    console.error('Error fetching admin dashboard stats')
    return {
      revenue: 0,
      ordersCount: 0,
      customersCount: 0,
      productsCount: 0,
      averageOrderValue: 0
    }
  }

  const paidOrders = orders?.filter((o: any) => o.payment_status === 'paid') || []
  const revenue = paidOrders.reduce((sum: number, o: any) => sum + Number(o.total), 0)
  const ordersCount = orders?.length || 0
  const averageOrderValue = ordersCount > 0 ? (revenue / ordersCount) : 0

  return {
    revenue,
    ordersCount,
    customersCount: customersCount || 0,
    productsCount: productsCount || 0,
    averageOrderValue
  }
}

export async function getSalesData() {
  if (isSupabasePlaceholder()) {
    return mockDb.getSalesData()
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { data: orders, error } = await supabase
    .from('orders')
    .select('created_at, total')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: true })

  if (error || !orders) return []

  // Group by date
  const groups: { [key: string]: number } = {}
  orders.forEach((order: any) => {
    const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
    groups[dateStr] = (groups[dateStr] || 0) + Number(order.total)
  })

  return Object.keys(groups).map(date => ({
    date,
    sales: groups[date]
  }))
}

// Customers Management
export async function getCustomersList() {
  if (isSupabasePlaceholder()) {
    return mockDb.getCustomersList()
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customer profiles:', error)
    return []
  }

  return data
}

// Product Management
export async function createProduct(data: z.infer<typeof ProductFormSchema>) {
  if (isSupabasePlaceholder()) {
    return mockDb.createProduct(data)
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)
  
  const validated = ProductFormSchema.parse(data)

  // Ensure category exists to satisfy foreign key constraint
  if (validated.category_id) {
    const { data: catExists } = await supabase
      .from('categories')
      .select('id')
      .eq('id', validated.category_id)
      .maybeSingle()

    if (!catExists) {
      const defaultCategories = [
        {
          id: 'e51631eb-1234-4567-89ab-cdef01234567',
          name: 'Tech & Devices',
          slug: 'tech-devices',
          description: 'Minimalist desk accessories, charging bricks, and mechanical keys.',
          image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'f61732fc-2345-5678-9abc-def012345678',
          name: 'Street Apparel',
          slug: 'street-apparel',
          description: 'Premium quality hoodies, sweatpants, and everyday wear essentials.',
          image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'a1111111-1111-1111-1111-111111111111',
          name: 'Fashion & Clothing',
          slug: 'fashion',
          description: 'Trendy streetwear, stylish jackets, luxury wear, and footwear.',
          image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'b2222222-2222-2222-2222-222222222222',
          name: 'Gaming Gear',
          slug: 'gaming',
          description: 'High-performance mechanical keyboards, precision mice, and gaming setups.',
          image_url: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'c3333333-3333-3333-3333-333333333333',
          name: 'Stationery & Office',
          slug: 'stationery',
          description: 'Premium journals, leather notebooks, elegant writing instruments, and desk organizers.',
          image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'd4444444-4444-4444-4444-444444444444',
          name: 'Cosmetics & Beauty',
          slug: 'cosmetics',
          description: 'Organic skincare products, luxury perfumes, and beauty essentials.',
          image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop'
        }
      ]
      const catToInsert = defaultCategories.find(c => c.id === validated.category_id)
      if (catToInsert) {
        await supabase.from('categories').insert(catToInsert)
      }
    }
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      price: validated.price,
      compare_price: validated.compare_price,
      cost_price: validated.cost_price,
      sku: validated.sku,
      stock_quantity: validated.stock_quantity,
      category_id: validated.category_id || null,
      images: validated.images,
      tags: validated.tags,
      is_active: validated.is_active,
      is_featured: validated.is_featured,
      weight: validated.weight
    })
    .select('id')
    .single()

  if (error || !product) {
    console.error('Error creating product:', error)
    throw new Error(error?.message || 'Failed to create product')
  }

  // Insert variants if any
  if (validated.variants.length > 0) {
    const variantsData = validated.variants.map(v => ({
      product_id: product.id,
      name: v.name,
      price: v.price,
      stock_quantity: v.stock_quantity,
      sku: v.sku,
      options: {}
    }))

    const { error: variantError } = await supabase
      .from('product_variants')
      .insert(variantsData)

    if (variantError) {
      console.error('Error inserting variants:', variantError)
    }
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  return product
}

export async function updateProduct(id: string, data: z.infer<typeof ProductFormSchema>) {
  if (isSupabasePlaceholder()) {
    return mockDb.updateProduct(id, data)
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)
  
  const validated = ProductFormSchema.parse(data)

  // Ensure category exists to satisfy foreign key constraint
  if (validated.category_id) {
    const { data: catExists } = await supabase
      .from('categories')
      .select('id')
      .eq('id', validated.category_id)
      .maybeSingle()

    if (!catExists) {
      const defaultCategories = [
        {
          id: 'e51631eb-1234-4567-89ab-cdef01234567',
          name: 'Tech & Devices',
          slug: 'tech-devices',
          description: 'Minimalist desk accessories, charging bricks, and mechanical keys.',
          image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'f61732fc-2345-5678-9abc-def012345678',
          name: 'Street Apparel',
          slug: 'street-apparel',
          description: 'Premium quality hoodies, sweatpants, and everyday wear essentials.',
          image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'a1111111-1111-1111-1111-111111111111',
          name: 'Fashion & Clothing',
          slug: 'fashion',
          description: 'Trendy streetwear, stylish jackets, luxury wear, and footwear.',
          image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'b2222222-2222-2222-2222-222222222222',
          name: 'Gaming Gear',
          slug: 'gaming',
          description: 'High-performance mechanical keyboards, precision mice, and gaming setups.',
          image_url: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'c3333333-3333-3333-3333-333333333333',
          name: 'Stationery & Office',
          slug: 'stationery',
          description: 'Premium journals, leather notebooks, elegant writing instruments, and desk organizers.',
          image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'd4444444-4444-4444-4444-444444444444',
          name: 'Cosmetics & Beauty',
          slug: 'cosmetics',
          description: 'Organic skincare products, luxury perfumes, and beauty essentials.',
          image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop'
        }
      ]
      const catToInsert = defaultCategories.find(c => c.id === validated.category_id)
      if (catToInsert) {
        await supabase.from('categories').insert(catToInsert)
      }
    }
  }

  const { error } = await supabase
    .from('products')
    .update({
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      price: validated.price,
      compare_price: validated.compare_price,
      cost_price: validated.cost_price,
      sku: validated.sku,
      stock_quantity: validated.stock_quantity,
      category_id: validated.category_id || null,
      images: validated.images,
      tags: validated.tags,
      is_active: validated.is_active,
      is_featured: validated.is_featured,
      weight: validated.weight
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating product:', error)
    throw new Error(error.message)
  }

  // Re-create variants (delete existing variants, insert new ones)
  await supabase.from('product_variants').delete().eq('product_id', id)
  if (validated.variants.length > 0) {
    const variantsData = validated.variants.map(v => ({
      product_id: id,
      name: v.name,
      price: v.price,
      stock_quantity: v.stock_quantity,
      sku: v.sku,
      options: {}
    }))

    await supabase.from('product_variants').insert(variantsData)
  }

  revalidatePath('/admin/products')
  revalidatePath(`/products/${validated.slug}`)
  revalidatePath('/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  if (isSupabasePlaceholder()) {
    return mockDb.deleteProduct(id)
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  return { success: true }
}

// Order management
export async function getAdminOrders() {
  if (isSupabasePlaceholder()) {
    return mockDb.getAdminOrders()
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        full_name,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin orders:', error)
    return []
  }

  return data
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (isSupabasePlaceholder()) {
    return mockDb.updateOrderStatus(orderId, status)
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { error } = await supabase
    .from('orders')
    .update({ status: status as any })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error)
    throw new Error(error.message)
  }

  // Trigger a system notification for the customer about order updates
  const { data: order } = await supabase.from('orders').select('user_id').eq('id', orderId).single()
  if (order?.user_id) {
    await supabase.from('notifications').insert({
      user_id: order.user_id,
      type: 'order_update',
      title: `Order Status updated: ${status.toUpperCase()}`,
      message: `Your order #${orderId.slice(0, 8)} status has been updated to ${status}.`
    })
  }

  revalidatePath(`/account/orders/${orderId}`)
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
  return { success: true }
}

// Coupons Management
export async function getCoupons() {
  if (isSupabasePlaceholder()) {
    return mockDb.getCoupons()
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false } as any)

  if (error) {
    const { data: data2 } = await supabase.from('coupons').select('*').order('code', { ascending: true })
    return data2 || []
  }

  return data
}

export async function createCoupon(data: {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_amount: number
  max_uses: number
  expires_at: string
  is_active: boolean
}) {
  if (isSupabasePlaceholder()) {
    return mockDb.createCoupon(data)
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { data: coupon, error } = await supabase
    .from('coupons')
    .insert({
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      min_order_amount: data.min_order_amount,
      max_uses: data.max_uses,
      expires_at: data.expires_at,
      is_active: data.is_active
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error creating coupon:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/coupons')
  return coupon
}

export async function deleteCoupon(id: string) {
  if (isSupabasePlaceholder()) {
    return mockDb.deleteCoupon(id)
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting coupon:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/coupons')
  return { success: true }
}

// Advertisements Management
export async function getAdvertisements() {
  if (isSupabasePlaceholder()) {
    return mockDb.getAdvertisements()
  }

  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching advertisements:', error)
    return mockDb.getAdvertisements()
  }

  return data
}

export async function createAdvertisement(data: {
  image_url: string
  label: string
  title: string
  description: string
  link_url: string
  button_text: string
  is_active: boolean
}) {
  if (isSupabasePlaceholder()) {
    return mockDb.createAdvertisement(data)
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { data: ad, error } = await supabase
    .from('advertisements')
    .insert(data)
    .select('*')
    .single()

  if (error) {
    console.error('Error creating advertisement:', error)
    throw new Error(error.message)
  }

  return ad
}

export async function updateAdvertisement(id: string, data: {
  image_url?: string
  label?: string
  title?: string
  description?: string
  link_url?: string
  button_text?: string
  is_active?: boolean
}) {
  if (isSupabasePlaceholder()) {
    return mockDb.updateAdvertisement(id, data)
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { error } = await supabase
    .from('advertisements')
    .update(data)
    .eq('id', id)

  if (error) {
    console.error('Error updating advertisement:', error)
    throw new Error(error.message)
  }

  return { success: true }
}

export async function deleteAdvertisement(id: string) {
  if (isSupabasePlaceholder()) {
    return mockDb.deleteAdvertisement(id)
  }

  const supabase = createClient() as any
  await verifyAdmin(supabase)

  const { error } = await supabase
    .from('advertisements')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting advertisement:', error)
    throw new Error(error.message)
  }

  return { success: true }
}
