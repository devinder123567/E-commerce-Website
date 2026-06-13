import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary" />
    </div>
  )
}
