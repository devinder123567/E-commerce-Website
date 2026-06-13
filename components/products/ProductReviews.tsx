'use client'

import { useState } from 'react'
import { addReview } from '@/actions/reviews'
import { useAuthStore } from '@/lib/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '../shared/StarRating'
import { formatDate } from '@/lib/utils/formatDate'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Link } from 'wouter'

interface ProductReviewsProps {
  productId: string
  reviews: any[]
  loading: boolean
  onReviewAdded: () => void
}

export function ProductReviews({ productId, reviews, loading, onReviewAdded }: ProductReviewsProps) {
  const { user } = useAuthStore()

  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setMsg(null)

    try {
      await addReview({
        productId,
        rating,
        title,
        body
      })
      setMsg({ type: 'success', text: 'Thank you! Your review has been submitted successfully.' })
      setTitle('')
      setBody('')
      setRating(5)
      onReviewAdded()
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.message || 'Failed to submit review. You must have purchased this product.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const starCounts = [0, 0, 0, 0, 0] // 5 down to 1
  reviews.forEach(r => {
    const starIdx = 5 - r.rating
    if (starIdx >= 0 && starIdx < 5) {
      starCounts[starIdx]++
    }
  })

  const totalReviews = reviews.length

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 bg-muted/10 border border-muted/50 rounded-2xl">
        <div className="text-center md:border-r border-muted md:pr-6 flex flex-col items-center justify-center h-full">
          <h4 className="text-5xl font-black text-foreground">{averageRating}</h4>
          <div className="mt-2">
            <StarRating rating={Math.round(Number(averageRating))} size={18} />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Based on {reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}</p>
        </div>
        
        <div className="md:col-span-2 space-y-2.5">
          {starCounts.map((count, index) => {
            const starNum = 5 - index
            const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
            return (
              <div key={starNum} className="flex items-center gap-3 text-xs font-semibold">
                <span className="w-8 text-right text-muted-foreground shrink-0">{starNum} star</span>
                <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden border border-muted/20">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-10 text-muted-foreground text-left shrink-0">{percent}%</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Customer Reviews ({reviews.length})</h3>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="divide-y divide-muted space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{rev.profiles?.full_name || 'Anonymous User'}</span>
                    {rev.is_verified_purchase && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{formatDate(rev.created_at)}</span>
                </div>
                <StarRating rating={rev.rating} size={14} />
                <h5 className="font-bold text-sm text-foreground">{rev.title}</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">{rev.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="p-6 border border-muted/80 rounded-2xl space-y-4 bg-background/50 backdrop-blur-md">
          <h4 className="text-base font-bold text-foreground uppercase tracking-wide">Write a Review</h4>
          <p className="text-xs text-muted-foreground">Share your thoughts with other customers. Only verified buyers can submit reviews.</p>

          {msg && (
            <div className={`p-4 rounded-xl flex items-start gap-2 text-xs border ${
              msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              {msg.type === 'success' ? <CheckCircle size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
              <span>{msg.text}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rating</label>
            <StarRating rating={rating} onRatingChange={setRating} interactive size={24} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Title</label>
            <Input
              type="text"
              placeholder="e.g. Comfortable fit, great quality"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-muted rounded-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Review Details</label>
            <Textarea
              placeholder="Write your review comments here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="border-muted rounded-xl"
            />
          </div>

          <Button type="submit" disabled={submitting} className="rounded-full px-6 font-bold text-xs uppercase tracking-wide">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      ) : (
        <div className="p-6 border border-muted/50 border-dashed rounded-2xl text-center bg-muted/10">
          <p className="text-xs text-muted-foreground">Please <Link href="/login" className="text-primary font-bold hover:underline">Log In</Link> to write a review.</p>
        </div>
      )}
    </div>
  )
}
