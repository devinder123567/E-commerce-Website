import { Star } from 'lucide-react'

export function StarRating({
  rating,
  onRatingChange,
  interactive = false,
  size = 18,
}: {
  rating: number
  onRatingChange?: (r: number) => void
  interactive?: boolean
  size?: number
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRatingChange?.(star)}
          className={`transition-all duration-150 ${
            interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
          }`}
        >
          <Star
            size={size}
            className={`${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30 fill-transparent'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
