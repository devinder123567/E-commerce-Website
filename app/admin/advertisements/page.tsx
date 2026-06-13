'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/lib/hooks/useViteNavigation'
import {
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement
} from '@/actions/admin'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Plus, Trash, Upload, X, Edit2, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'wouter'
import { cn } from '@/lib/utils'
import { isSupabasePlaceholder } from '@/lib/supabase/mockDb'
import { createClient } from '@/lib/supabase/client'

// Image compression logic
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
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

// Cloudinary upload
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

export default function AdminAdvertisementsPage() {
  const router = useRouter()
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<any>(null)

  // Form states
  const [imageUrl, setImageUrl] = useState('')
  const [label, setLabel] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [buttonText, setButtonText] = useState('Buy Now')
  const [isActive, setIsActive] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Load Ads
  const loadAds = async () => {
    setLoading(true)
    try {
      const data = await getAdvertisements()
      setAds(data || [])
    } catch (err) {
      console.error('Failed to load advertisements:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAds()
  }, [])

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      // 1. Try Cloudinary
      try {
        const url = await uploadToCloudinary(file)
        setImageUrl(url)
        setUploadingImage(false)
        return
      } catch (cloudinaryErr: any) {
        console.warn('Cloudinary upload skipped or failed:', cloudinaryErr.message)
      }

      // 2. Try Supabase
      if (!isSupabasePlaceholder()) {
        try {
          const supabase = createClient()
          const fileExt = file.name.split('.').pop()
          const fileName = `ad_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
          const filePath = `ad-images/${fileName}`

          const { error } = await supabase.storage
            .from('products') // Reuse products bucket or default public bucket
            .upload(filePath, file)

          if (error) throw error

          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath)

          setImageUrl(publicUrl)
          setUploadingImage(false)
          return
        } catch (supabaseErr: any) {
          console.warn('Supabase storage upload failed:', supabaseErr.message)
        }
      }

      // 3. Fallback to Local Base64 compression
      const base64 = await compressImage(file)
      setImageUrl(base64)
    } catch (err: any) {
      alert(`Error processing image: ${err.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const openCreateForm = () => {
    setEditingAd(null)
    setImageUrl('')
    setLabel('Featured Item')
    setTitle('')
    setDescription('')
    setLinkUrl('/products')
    setButtonText('Buy Now')
    setIsActive(true)
    setFormOpen(true)
  }

  const openEditForm = (ad: any) => {
    setEditingAd(ad)
    setImageUrl(ad.image_url || '')
    setLabel(ad.label || '')
    setTitle(ad.title || '')
    setDescription(ad.description || '')
    setLinkUrl(ad.link_url || '')
    setButtonText(ad.button_text || 'Buy Now')
    setIsActive(ad.is_active ?? true)
    setFormOpen(true)
  }

  const handleToggleActive = async (ad: any) => {
    try {
      await updateAdvertisement(ad.id, { is_active: !ad.is_active })
      loadAds()
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement banner?')) return
    try {
      await deleteAdvertisement(id)
      loadAds()
    } catch (err: any) {
      alert(`Error deleting advertisement: ${err.message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl) {
      alert('Please provide an image URL or upload an image file.')
      return
    }
    if (!title) {
      alert('Please provide a title.')
      return
    }

    const payload = {
      image_url: imageUrl,
      label,
      title,
      description,
      link_url: linkUrl,
      button_text: buttonText,
      is_active: isActive
    }

    try {
      if (editingAd) {
        await updateAdvertisement(editingAd.id, payload)
        alert('Advertisement updated successfully!')
      } else {
        await createAdvertisement(payload)
        alert('Advertisement created successfully!')
      }
      setFormOpen(false)
      loadAds()
    } catch (err: any) {
      alert(`Error saving advertisement: ${err.message}`)
    }
  }

  if (loading && ads.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-1">
      {/* Header breadcrumb */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link>
            <span>/</span>
            <span className="text-foreground">Advertisements</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Homepage Advertisements</h1>
          <p className="text-sm text-muted-foreground">Add or modify banner advertisements shown on the storefront homepage hero slider.</p>
        </div>
        {!formOpen && (
          <Button onClick={openCreateForm} className="rounded-full gap-2 font-bold self-start">
            <Plus size={16} /> Add Advertisement
          </Button>
        )}
      </div>

      {formOpen ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Form Card */}
          <Card className="border border-muted/50 bg-background/50 backdrop-blur-sm rounded-2xl">
            <CardHeader className="border-b border-muted pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center justify-between">
                <span>{editingAd ? 'Edit Advertisement' : 'Create Advertisement'}</span>
                <Button variant="ghost" size="icon" onClick={() => setFormOpen(false)} className="rounded-full text-muted-foreground hover:bg-muted/40">
                  <X size={16} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Ad Tag / Label</label>
                    <Input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g. FEATURED ITEM or SPECIAL DISCOUT"
                      required
                      className="rounded-full border-muted text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Ad Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Noise Cancelling Studio Pro"
                      required
                      className="rounded-full border-muted text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Description / Caption / Price</label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. $299.00 or Get 20% off apparel items"
                      className="rounded-full border-muted text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Image Source</label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                        value={imageUrl.startsWith('data:') ? 'Local compressed image (uploaded from file)' : imageUrl}
                        onChange={(e) => {
                          const val = e.target.value
                          if (!val.startsWith('Local compressed image')) {
                            setImageUrl(val)
                          }
                        }}
                        className="rounded-full border-muted flex-1 text-xs"
                      />
                      {imageUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setImageUrl('')}
                          className="rounded-full text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    <div className="mt-3">
                      {imageUrl ? (
                        <div className="relative w-44 h-32 rounded-xl overflow-hidden border border-muted bg-muted/20 group">
                          <img src={imageUrl} alt="Ad preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                            title="Remove Image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted/80 rounded-xl p-4 text-center hover:border-primary/50 transition-colors bg-muted/10 relative min-h-[120px]">
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
                              <LoadingSpinner size={20} />
                              <p className="text-[10px] text-muted-foreground animate-pulse">Processing image file...</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                                <Upload size={16} />
                              </div>
                              <p className="text-xs font-bold text-foreground">Upload image from device</p>
                              <p className="text-[9px] text-muted-foreground">Supports automatic compression to fit client storage</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Redirect Link URL</label>
                      <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="e.g. /products/headphones"
                        required
                        className="rounded-full border-muted text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Button CTA Text</label>
                      <Input
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder="e.g. Buy Now"
                        required
                        className="rounded-full border-muted text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-muted text-primary"
                      />
                      Active (Display in Homepage carousel)
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-muted">
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="rounded-full border-muted">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploadingImage} className="rounded-full px-6 font-bold">
                    {editingAd ? 'Save Changes' : 'Create Banner'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right Column: Live Mockup Preview */}
          <div className="space-y-4 sticky top-24">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary animate-pulse" /> Live Storefront Hero Preview
            </h3>
            
            <div className="flex flex-col gap-6 bg-muted/10 p-6 rounded-3xl border border-muted/50">
              <div className="flex flex-col lg:flex-row items-center gap-8 py-6">
                {/* Left side text preview */}
                <div className="flex-1 space-y-4 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <Sparkles size={10} /> Curated Collections Drop
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                    Modern Aesthetics.<br />
                    <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                      Exceptional Quality.
                    </span>
                  </h2>
                  <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
                    Explore our massive range of fashion accessories, premium cosmetics, smart tech gadgets, and lifestyle essentials.
                  </p>
                </div>

                {/* Right side ad banner mockup */}
                <div className="w-full max-w-[320px] aspect-[4/3] rounded-2xl overflow-hidden border border-muted/60 bg-muted/20 relative shadow-xl">
                  {imageUrl ? (
                    <>
                      {/* Blurred cover backdrop */}
                      <img
                        src={imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-30 pointer-events-none"
                      />
                      {/* Fully visible contain-fit image */}
                      <img
                        src={imageUrl}
                        alt="Banner Preview"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/40 p-4 text-center">
                      <p className="text-xs text-muted-foreground italic font-semibold">No Image Provided Yet</p>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 bg-background/50 backdrop-blur-xl border border-white/10 p-3.5 rounded-xl flex items-center justify-between shadow-lg">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-[8px] font-bold text-primary uppercase tracking-wider truncate">{label || 'Tag Label'}</p>
                      <h4 className="font-extrabold text-xs text-foreground mt-0.5 truncate">{title || 'Product Title'}</h4>
                      {description && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{description}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <div className={cn(buttonVariants({ size: 'sm' }), 'h-7 rounded-full px-3 font-bold text-[10px]')}>
                        {buttonText || 'Buy Now'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : ads.length === 0 ? (
        <Card className="border border-muted/50 p-12 text-center space-y-4 rounded-3xl">
          <p className="text-muted-foreground text-sm">No advertisement banners found. Add your first advertisement to replace the default static headphones card.</p>
          <Button onClick={openCreateForm} className="rounded-full font-bold">
            <Plus size={16} className="mr-1.5" /> Add Advertisement
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <Card key={ad.id} className={cn("border bg-background/50 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:border-primary/20", !ad.is_active && "opacity-60")}>
              <div>
                <div className="relative aspect-[16/10] bg-muted overflow-hidden border-b border-muted">
                  {/* Blurred cover backdrop */}
                  <img
                    src={ad.image_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-35 pointer-events-none"
                  />
                  {/* Fully visible contain-fit image */}
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  
                  {/* Dynamic tag banner */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                    {ad.label || 'PROMOTIONAL'}
                  </div>

                  <button
                    onClick={() => handleToggleActive(ad)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors"
                    title={ad.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {ad.is_active ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
                
                <div className="p-5 space-y-2">
                  <h3 className="font-extrabold text-base text-foreground leading-snug">{ad.title}</h3>
                  {ad.description && <p className="text-xs text-muted-foreground line-clamp-2">{ad.description}</p>}
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1.5">
                    <span className="bg-muted px-2.5 py-1 rounded-full font-mono">CTA: {ad.button_text}</span>
                    <span className="bg-muted px-2.5 py-1 rounded-full font-mono max-w-[150px] truncate" title={ad.link_url}>Path: {ad.link_url}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-muted/50 mt-2 flex justify-between gap-3 items-center">
                <span className={cn("text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border", ad.is_active ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" : "text-muted-foreground border-muted/20 bg-muted/10")}>
                  {ad.is_active ? 'Active' : 'Inactive'}
                </span>

                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditForm(ad)} className="rounded-full w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10" title="Edit Advertisement">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)} className="rounded-full w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Delete Advertisement">
                    <Trash className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
