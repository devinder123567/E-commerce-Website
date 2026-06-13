'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'
import { Button, buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit2, Database } from 'lucide-react'
import { Link } from 'wouter'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { seedStoreDatabase } from '@/actions/products'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const handleSeed = async () => {
    if (!confirm("Are you sure you want to seed/reset the database with 900+ products? This will upsert categories, products, and variants.")) return;
    setSeeding(true)
    try {
      if (isSupabasePlaceholder()) {
        localStorage.removeItem('devi_mock_products')
        localStorage.removeItem('devi_mock_categories')
        alert("Mock database reset! Page will reload to populate 900+ items.")
        window.location.reload()
      } else {
        await seedStoreDatabase()
        alert("Database seeded successfully with 900+ products!")
        window.location.reload()
      }
    } catch (err: any) {
      console.error(err)
      alert("Failed to seed database: " + err.message)
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    async function loadProducts() {
      if (isSupabasePlaceholder()) {
        const allProducts = JSON.parse(localStorage.getItem('devi_mock_products') || '[]')
        allProducts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setProducts(allProducts)
        setLoading(false)
        return
      }

      const supabase = createClient()
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
        setProducts(data || [])
      } catch (err) {
        console.error('Error fetching admin products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 flex-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Manage Products</h1>
          <p className="text-sm text-muted-foreground">Add new products, edit pricing details, and update inventory counts.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleSeed}
            disabled={seeding}
            variant="outline"
            className="rounded-full gap-2 px-5 border-muted hover:bg-muted/30"
          >
            <Database size={16} className={seeding ? "animate-spin" : ""} />
            {seeding ? "Seeding..." : "Seed 900+ Products"}
          </Button>
          <Link href="/admin/products/new" className={cn(buttonVariants({ size: "sm" }), "rounded-full gap-2 px-5")}>
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      <div className="border border-muted/50 rounded-2xl bg-background/50 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-muted hover:bg-transparent">
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Product Name</TableHead>
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">SKU</TableHead>
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Price</TableHead>
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Stock Qty</TableHead>
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground text-xs py-8">
                  No products available in the catalog. Add some items to start.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product: any) => (
                <TableRow key={product.id} className="border-muted/55 hover:bg-muted/10 transition-colors">
                  <TableCell className="font-bold text-xs">{product.name}</TableCell>
                  <TableCell className="text-xs font-mono">{product.sku}</TableCell>
                  <TableCell className="text-xs font-semibold">{formatCurrency(Number(product.price))}</TableCell>
                  <TableCell className="text-xs font-semibold">{product.stock_quantity}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      product.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        title="Edit"
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full w-8 h-8 hover:bg-muted/30")}
                      >
                        <Edit2 size={14} className="text-muted-foreground" />
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
