'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats, getSalesData } from '@/actions/admin'
import { seedStoreDatabase } from '@/actions/products'
import { AnalyticsChart } from '@/components/admin/AnalyticsChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { DollarSign, ShoppingBag, Users, Layers, TrendingUp } from 'lucide-react'
import { Link } from 'wouter'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const handleSeed = async () => {
    if (!confirm("Are you sure you want to seed/re-seed the store database? This will sync categories and products (including brand products).")) return
    setSeeding(true)
    try {
      await seedStoreDatabase()
      alert("Database seeded successfully!")
      window.location.reload()
    } catch (err: any) {
      alert("Failed to seed database: " + err.message)
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, salesData] = await Promise.all([
          getDashboardStats(),
          getSalesData()
        ])
        setStats(statsData)
        setSales(salesData)
      } catch (error) {
        console.error('Error loading admin dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-center">
        <p className="text-red-500 font-bold">Failed to load admin stats. Please check permissions.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-1">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor sales performance, manage listings, and fulfill orders.</p>
        </div>
        <Button
          onClick={handleSeed}
          disabled={seeding}
          className="rounded-full px-6 font-bold text-xs uppercase tracking-wider gap-2 shadow-lg shadow-primary/20"
        >
          {seeding ? "Seeding..." : "Seed Database"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{formatCurrency(stats.revenue)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Confirmed Stripe payments</p>
          </CardContent>
        </Card>

        <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Orders Placed</CardTitle>
            <ShoppingBag className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{stats.ordersCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Pending and paid checkouts</p>
          </CardContent>
        </Card>

        <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered Customers</CardTitle>
            <Users className="w-4 h-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{stats.customersCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Active customer profiles</p>
          </CardContent>
        </Card>

        <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Products in Catalog</CardTitle>
            <Layers className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{stats.productsCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Active catalog list</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
        <CardHeader className="flex items-center justify-between pb-4 flex-row border-b border-muted">
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Sales Trend Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsChart data={sales} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        <Link href="/admin/products" className="p-6 bg-muted/20 border border-muted hover:border-primary/30 rounded-2xl text-center space-y-2 block transition-all duration-200">
          <h4 className="font-extrabold text-sm uppercase text-foreground">Manage Products Catalog</h4>
          <p className="text-xs text-muted-foreground">Create, edit, or delete catalog items and variants.</p>
        </Link>
        <Link href="/admin/orders" className="p-6 bg-muted/20 border border-muted hover:border-primary/30 rounded-2xl text-center space-y-2 block transition-all duration-200">
          <h4 className="font-extrabold text-sm uppercase text-foreground">Fulfill Orders Queue</h4>
          <p className="text-xs text-muted-foreground">Fulfill orders, track shipping status, and process returns.</p>
        </Link>
        <Link href="/admin/advertisements" className="p-6 bg-muted/20 border border-muted hover:border-primary/30 rounded-2xl text-center space-y-2 block transition-all duration-200">
          <h4 className="font-extrabold text-sm uppercase text-foreground">Manage Advertisements</h4>
          <p className="text-xs text-muted-foreground">Create, edit, and toggle promotional homepage banners.</p>
        </Link>
        <Link href="/products" className="p-6 bg-muted/20 border border-muted hover:border-primary/30 rounded-2xl text-center space-y-2 block transition-all duration-200">
          <h4 className="font-extrabold text-sm uppercase text-foreground">View Public Storefront</h4>
          <p className="text-xs text-muted-foreground">Browse the main storefront shop catalogue as a customer.</p>
        </Link>
      </div>
    </div>
  )
}
