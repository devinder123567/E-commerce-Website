'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { ThemeProvider } from './ThemeProvider'

function AuthListener() {
  useAuth()
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthListener />
      {children}
    </ThemeProvider>
  )
}
