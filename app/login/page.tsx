'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from '@/lib/hooks/useViteNavigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from 'wouter'
import { useAuthStore } from '@/lib/store/authStore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'

function LoginForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Forgot Password mock state
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState('')

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotLoading(true)
    setTimeout(() => {
      setForgotLoading(false)
      setForgotSuccess(`A simulated password recovery link has been sent to ${forgotEmail}. Please check your inbox!`)
    }, 1200)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (isSupabasePlaceholder()) {
      if (email === 'dev@gmail.com' && password === '23341a0565') {
        const mockUser = {
          id: '00000000-0000-0000-0000-000000000000',
          email: 'dev@gmail.com',
          user_metadata: { full_name: 'Developer Admin' },
        } as any
        
        const profiles = JSON.parse(localStorage.getItem('devi_mock_profiles') || '[]')
        let mockProfile = profiles.find((p: any) => p.id === mockUser.id)
        if (!mockProfile) {
          mockProfile = {
            id: mockUser.id,
            full_name: 'Developer Admin',
            role: 'admin',
            phone: '1234567890',
            avatar_url: '',
          }
          profiles.push(mockProfile)
          localStorage.setItem('devi_mock_profiles', JSON.stringify(profiles))
        }
        
        useAuthStore.getState().setAuth(mockUser, mockProfile)
        localStorage.setItem('devi-mock-session', JSON.stringify({ user: mockUser, profile: mockProfile }))
        
        setLoading(false)
        const next = searchParams.get('next') || '/'
        router.push(next)
        router.refresh()
        return
      }

      // Check registered local mock accounts
      const mockAccounts = JSON.parse(localStorage.getItem('devi_mock_accounts') || '[]')
      const account = mockAccounts.find(
        (acc: any) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
      )

      if (account) {
        const mockUser = {
          id: account.id,
          email: account.email,
          user_metadata: { full_name: account.fullName },
        } as any

        const profiles = JSON.parse(localStorage.getItem('devi_mock_profiles') || '[]')
        let mockProfile = profiles.find((p: any) => p.id === account.id)
        if (!mockProfile) {
          mockProfile = {
            id: account.id,
            full_name: account.fullName,
            role: 'customer',
            phone: '',
            avatar_url: '',
          }
          profiles.push(mockProfile)
          localStorage.setItem('devi_mock_profiles', JSON.stringify(profiles))
        }

        useAuthStore.getState().setAuth(mockUser, mockProfile)
        localStorage.setItem('devi-mock-session', JSON.stringify({ user: mockUser, profile: mockProfile }))

        setLoading(false)
        const next = searchParams.get('next') || '/'
        router.push(next)
        router.refresh()
        return
      }

      setErrorMsg('Invalid email or password (mock mode).')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    const next = searchParams.get('next') || '/'
    router.push(next)
    router.refresh()
  }

  return (
    <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
      <Card className="w-full max-w-md border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight">Log In</h1>
            <p className="text-xs text-muted-foreground mt-1">Access your customer profile and tracker.</p>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              {errorMsg}
            </p>
          )}

          {showForgot ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-center pb-2 border-b border-muted/50 mb-2">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-foreground">Password Recovery</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">We will send you a simulated link to reset your password.</p>
              </div>

              {forgotSuccess && (
                <p className="text-xs text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                  {forgotSuccess}
                </p>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  placeholder="e.g. yourname@example.com"
                  className="rounded-full bg-black/40 text-white border-muted"
                />
              </div>

              <Button type="submit" disabled={forgotLoading} className="w-full rounded-full font-bold uppercase text-xs tracking-wider">
                {forgotLoading ? <LoadingSpinner size={16} /> : 'Send Reset Link'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false)
                  setForgotSuccess('')
                }}
                className="w-full text-center text-xs font-bold text-primary hover:underline mt-2 bg-transparent border-none p-0 cursor-pointer"
              >
                Back to Log In
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-full bg-black/40 text-white border-muted" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email)
                      setShowForgot(true)
                    }}
                    className="text-[10px] font-bold text-primary hover:underline bg-transparent border-none p-0 cursor-pointer focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-full bg-black/40 text-white border-muted" />
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-full font-bold uppercase text-xs tracking-wider">
                {loading ? <LoadingSpinner size={16} /> : 'Log In'}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
export const dynamic = 'force-dynamic'
