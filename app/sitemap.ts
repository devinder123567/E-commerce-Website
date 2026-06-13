import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elitecart.com'

  const { data } = await supabase.from('products').select('slug, updated_at').eq('is_active', true)
  const products = data as any[] | null

  const productUrls = (products || []).map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
  }))

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/cart`,
      lastModified: new Date(),
    },
    ...productUrls,
  ]
}
export const dynamic = 'force-dynamic'
