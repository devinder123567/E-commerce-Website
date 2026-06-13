import React from 'react'

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string
  description: string
  icon?: any
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-muted rounded-xl bg-background/50 backdrop-blur-sm max-w-md mx-auto my-8">
      {Icon && (
        <div className="p-3 bg-muted/40 rounded-full mb-4 text-muted-foreground animate-bounce">
          <Icon className="w-10 h-10" />
        </div>
      )}
      <h3 className="text-xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6">{description}</p>
      {action && action}
    </div>
  )
}
