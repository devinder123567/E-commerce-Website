import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'
import { isSupabasePlaceholder, mockDb } from '@/lib/supabase/mockDb'

const ReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(5, 'Review description must be at least 5 characters')
})

export async function addReview(data: z.infer<typeof ReviewSchema>) {
  if (isSupabasePlaceholder()) {
    const mockSessionStr = localStorage.getItem('devi-mock-session')
    const user = mockSessionStr ? JSON.parse(mockSessionStr).user : null
    const payload = {
      ...data,
      user_id: user ? user.id : '00000000-0000-0000-0000-000000000000'
    }
    return mockDb.addReview(payload)
  }

  const supabase = createClient() as any
  const validated = ReviewSchema.parse(data)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Insert review. The database RLS policy will enforce verified purchase status.
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      product_id: validated.productId,
      user_id: user.id,
      rating: validated.rating,
      title: validated.title,
      body: validated.body,
      is_verified_purchase: true
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error inserting review:', error)
    throw new Error(error.message || 'Failed to submit review. You must have purchased this product to review it.')
  }

  return { success: true, review }
}

export async function getProductReviews(productId: string) {
  if (isSupabasePlaceholder()) {
    return mockDb.getProductReviews(productId)
  }

  const supabase = createClient() as any
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data
}
