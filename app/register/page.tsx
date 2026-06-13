'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from 'wouter'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'

export default function RegisterPage() {
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (isSupabasePlaceholder()) {
      const mockAccounts = JSON.parse(localStorage.getItem('devi_mock_accounts') || '[]')
      if (mockAccounts.some((acc: any) => acc.email.toLowerCase() === email.toLowerCase())) {
        setErrorMsg('Email address already registered (mock mode).')
        setLoading(false)
        return
      }

      const newId = 'u_' + Math.random().toString(36).substr(2, 9)
      const newAccount = {
        id: newId,
        email: email.toLowerCase(),
        password: password,
        fullName: fullName
      }
      mockAccounts.push(newAccount)
      localStorage.setItem('devi_mock_accounts', JSON.stringify(mockAccounts))

      const profiles = JSON.parse(localStorage.getItem('devi_mock_profiles') || '[]')
      profiles.push({
        id: newId,
        full_name: fullName,
        avatar_url: '',
        phone: '',
        role: 'customer',
        created_at: new Date().toISOString()
      })
      localStorage.setItem('devi_mock_profiles', JSON.stringify(profiles))

      setSuccessMsg('Registration successful! You can now log in using your email and password.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    setSuccessMsg('Registration successful! Please check your email for confirmation.')
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
      <Card className="w-full max-w-md border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight">Create Account</h1>
            <p className="text-xs text-muted-foreground mt-1">Register for coupon drops and order tracking.</p>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              {successMsg}
            </p>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
              <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="rounded-full bg-black/40 text-white border-muted" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-full bg-black/40 text-white border-muted" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-full bg-black/40 text-white border-muted" />
            </div>

            <Button type="submit" disabled={loading} className="w-full rounded-full font-bold uppercase text-xs tracking-wider">
              {loading ? <LoadingSpinner size={16} /> : 'Sign Up'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Log In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
export const dynamic = 'force-dynamic'
