import { createClient } from '@/lib/supabase/client'
import { isSupabasePlaceholder, mockDb } from '@/lib/supabase/mockDb'

export async function validateCoupon(code: string, subtotal: number) {
  if (isSupabasePlaceholder()) {
    return mockDb.validateCoupon(code, subtotal)
  }

  const supabase = createClient() as any
  
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !coupon) {
    return { success: false, message: 'Invalid or expired coupon code' }
  }

  if (coupon.used_count >= coupon.max_uses) {
    return { success: false, message: 'Coupon usage limit reached' }
  }

  if (subtotal < Number(coupon.min_order_amount)) {
    return {
      success: false,
      message: `Minimum order amount of $${coupon.min_order_amount} required`
    }
  }

  let discountAmount = 0
  if (coupon.type === 'percentage') {
    discountAmount = (subtotal * Number(coupon.value)) / 100
  } else {
    discountAmount = Number(coupon.value)
  }

  // Cap discount at subtotal
  discountAmount = Math.min(discountAmount, subtotal)

  return {
    success: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      min_order_amount: Number(coupon.min_order_amount)
    },
    discountAmount
  }
}
