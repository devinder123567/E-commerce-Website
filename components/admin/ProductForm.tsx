'use client'

import { useState } from 'react'
import { useRouter } from '@/lib/hooks/useViteNavigation'
import { createProduct, updateProduct } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { slugify } from '@/lib/utils/slugify'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { Plus, Trash, Upload, X } from 'lucide-react'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'
import { createClient } from '@/lib/supabase/client'

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 1200
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
          resolve(dataUrl)
        } else {
          resolve(e.target?.result as string)
        }
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const uploadToCloudinary = async (file: File) => {
  const env = (import.meta as any).env || {}
  const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
  const apiKey = env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ''
  const apiSecret = env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || ''

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary config missing in environment')
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString()
  const signatureString = `timestamp=${timestamp}${apiSecret}`
  
  const utf8 = new TextEncoder().encode(signatureString)
  const hashBuffer = await crypto.subtle.digest('SHA-1', utf8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData?.error?.message || 'Cloudinary upload response failed')
  }

  const resData = await res.json()
  return resData.secure_url
}

export function ProductForm({ product, categories }: { product?: any; categories: any[] }) {
  const router = useRouter()
  const isEdit = !!product

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(product?.name || '')
  const [slug, setSlug] = useState(product?.slug || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(product?.price || '')
  const [comparePrice, setComparePrice] = useState(product?.compare_price || '')
  const [costPrice, setCostPrice] = useState(product?.cost_price || '')
  const [sku, setSku] = useState(product?.sku || '')
  const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity || '0')
  const [categoryId, setCategoryId] = useState(product?.category_id || '')
  const [imageInput, setImageInput] = useState(product?.images?.[0] || '')
  const [tagsInput, setTagsInput] = useState(product?.tags?.join(', ') || '')
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false)
  const [weight, setWeight] = useState(product?.weight || '0')

  const [variants, setVariants] = useState<any[]>(product?.product_variants || [])
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      // 1. Try Cloudinary Signed Upload
      try {
        const cloudinaryUrl = await uploadToCloudinary(file)
        setImageInput(cloudinaryUrl)
        setUploadingImage(false)
        return
      } catch (cloudinaryErr: any) {
        console.warn('Cloudinary upload failed or not configured, trying next methods:', cloudinaryErr.message)
      }

      // 2. Try Supabase Storage
      if (!isSupabasePlaceholder()) {
        try {
          const supabase = createClient()
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
          const filePath = `product-images/${fileName}`

          const { error } = await supabase.storage
            .from('products')
            .upload(filePath, file)

          if (error) throw error

          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath)

          setImageInput(publicUrl)
          setUploadingImage(false)
          return
        } catch (supabaseErr: any) {
          console.warn('Supabase storage upload failed:', supabaseErr.message)
        }
      }

      // 3. Fallback to browser-side compression & local base64
      const compressedBase64 = await compressImage(file)
      setImageInput(compressedBase64)
      setUploadingImage(false)
    } catch (err: any) {
      alert(`Error processing image: ${err.message}`)
      setUploadingImage(false)
    }
  }

  const handleNameChange = (val: string) => {
    setName(val)
    if (!isEdit) {
      setSlug(slugify(val))
    }
  }

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', price: price || 0, stock_quantity: 0, sku: '' }])
  }

  const handleRemoveVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx))
  }

  const handleVariantChange = (idx: number, field: string, value: any) => {
    setVariants(
      variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name,
      slug,
      description,
      price: parseFloat(price) || 0,
      compare_price: comparePrice ? parseFloat(comparePrice) : null,
      cost_price: costPrice ? parseFloat(costPrice) : null,
      sku,
      stock_quantity: parseInt(stockQuantity) || 0,
      category_id: categoryId || null,
      images: imageInput ? [imageInput] : [],
      tags: tagsInput ? tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      is_active: isActive,
      is_featured: isFeatured,
      weight: parseFloat(weight) || 0,
      variants: variants.map((v) => ({
        name: v.name,
        price: parseFloat(v.price) || 0,
        stock_quantity: parseInt(v.stock_quantity) || 0,
        sku: v.sku
      }))
    }

    try {
      if (isEdit) {
        await updateProduct(product.id, payload)
        alert('Product updated successfully!')
      } else {
        await createProduct(payload)
        alert('Product created successfully!')
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Product Name</label>
              <Input value={name} onChange={(e) => handleNameChange(e.target.value)} required className="rounded-full border-muted" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Slug (URL Path)</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required className="rounded-full border-muted" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl border-muted" rows={4} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Price ($)</label>
              <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="rounded-full border-muted" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Compare Price ($)</label>
              <Input type="number" step="0.01" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} className="rounded-full border-muted" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Cost Price ($)</label>
              <Input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="rounded-full border-muted" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">SKU</label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} required className="rounded-full border-muted" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Stock Quantity</label>
              <Input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required className="rounded-full border-muted" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-background border border-muted text-foreground text-xs rounded-full px-4 h-10 focus:outline-none focus:border-primary"
              >
                <option value="">Select Category</option>
                {(categories.length > 0 ? categories : [
                  { id: 'e51631eb-1234-4567-89ab-cdef01234567', name: 'Tech & Devices' },
                  { id: 'f61732fc-2345-5678-9abc-def012345678', name: 'Street Apparel' },
                  { id: 'a1111111-1111-1111-1111-111111111111', name: 'Fashion & Clothing' },
                  { id: 'b2222222-2222-2222-2222-222222222222', name: 'Gaming Gear' },
                  { id: 'c3333333-3333-3333-3333-333333333333', name: 'Stationery & Office' },
                  { id: 'd4444444-4444-4444-4444-444444444444', name: 'Cosmetics & Beauty' }
                ]).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Product Image</label>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Paste direct image URL (e.g. https://images.unsplash.com/...) or upload below"
                  value={imageInput.startsWith('data:') ? 'Local compressed image (uploaded from file)' : imageInput}
                  onChange={(e) => {
                    const val = e.target.value
                    if (!val.startsWith('Local compressed image')) {
                      setImageInput(val)
                    }
                  }}
                  className="rounded-full border-muted flex-1 text-xs"
                />
                {imageInput && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setImageInput('')}
                    className="rounded-full text-xs"
                  >
                    Clear Image
                  </Button>
                )}
              </div>

              {imageInput ? (
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-muted bg-muted/20 group">
                  <img src={imageInput} alt="Product preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageInput('')}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted/80 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors bg-muted/10 relative min-h-[140px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <div className="space-y-2">
                      <LoadingSpinner size={24} />
                      <p className="text-xs text-muted-foreground animate-pulse">Uploading/Processing image...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                        <Upload size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Upload from device</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Automatically uploads to Cloudinary or falls back to local compression</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Tags (comma-separated)</label>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="tech, accessories, luxury" className="rounded-full border-muted" />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-muted">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-muted text-primary" /> Active (Public visibility)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-muted text-primary" /> Featured Storefront Item
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-muted pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider">Product Variants ({variants.length})</h3>
            <Button type="button" size="sm" onClick={handleAddVariant} className="rounded-full gap-1.5 text-xs px-4">
              <Plus size={14} /> Add Variant
            </Button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No variants created. This item will sell as a single main product SKU.</p>
          ) : (
            <div className="space-y-4">
              {variants.map((v, idx) => (
                <div key={idx} className="flex gap-3 items-end p-4 bg-muted/20 border border-muted/50 rounded-xl">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Variant Name</label>
                      <Input value={v.name} onChange={(e) => handleVariantChange(idx, 'name', e.target.value)} required placeholder="e.g. Medium / Black" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Price ($)</label>
                      <Input type="number" step="0.01" value={v.price} onChange={(e) => handleVariantChange(idx, 'price', e.target.value)} required className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Stock</label>
                      <Input type="number" value={v.stock_quantity} onChange={(e) => handleVariantChange(idx, 'stock_quantity', e.target.value)} required className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">SKU</label>
                      <Input value={v.sku} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} required className="bg-background" />
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVariant(idx)} className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} className="rounded-full border-muted">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="rounded-full px-8 font-bold">
          {loading ? <LoadingSpinner size={16} /> : (isEdit ? 'Save Changes' : 'Create Product')}
        </Button>
      </div>
    </form>
  )
}
