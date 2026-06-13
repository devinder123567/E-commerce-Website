// Mock Database layer using LocalStorage when Supabase is unconfigured (placeholders)
import { generateProducts } from '../utils/seedHelper'

const KEYS = {
  PRODUCTS: 'devi_mock_products',
  CATEGORIES: 'devi_mock_categories',
  ORDERS: 'devi_mock_orders',
  REVIEWS: 'devi_mock_reviews',
  COUPONS: 'devi_mock_coupons',
  PROFILES: 'devi_mock_profiles',
  ADS: 'devi_mock_advertisements',
}

// Check if current Supabase configuration is a placeholder
export const isSupabasePlaceholder = () => {
  const env = (import.meta as any).env || {}
  const url = env.NEXT_PUBLIC_SUPABASE_URL || ''
  return !url || url.includes('your-project.supabase.co')
}

// Initial Seed Data
const DEFAULT_CATEGORIES = [
  {
    id: 'e51631eb-1234-4567-89ab-cdef01234567',
    name: 'Tech & Devices',
    slug: 'tech-devices',
    description: 'Minimalist desk accessories, charging bricks, and mechanical keys.',
    image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'f61732fc-2345-5678-9abc-def012345678',
    name: 'Street Apparel',
    slug: 'street-apparel',
    description: 'Premium quality hoodies, sweatpants, and everyday wear essentials.',
    image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Fashion & Clothing',
    slug: 'fashion',
    description: 'Trendy streetwear, stylish jackets, luxury wear, and footwear.',
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Gaming Gear',
    slug: 'gaming',
    description: 'High-performance mechanical keyboards, precision mice, and gaming setups.',
    image_url: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Stationery & Office',
    slug: 'stationery',
    description: 'Premium journals, leather notebooks, elegant writing instruments, and desk organizers.',
    image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    name: 'Cosmetics & Beauty',
    slug: 'cosmetics',
    description: 'Organic skincare products, luxury perfumes, and beauty essentials.',
    image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Grocery & Pantry',
    slug: 'grocery',
    description: 'Organic foods, beverages, and household pantry items.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Home & Decor',
    slug: 'home',
    description: 'Aesthetic lighting, desk accents, organizers, and furniture pieces.',
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Travel & Luggage',
    slug: 'travel',
    description: 'Anti-theft smart bags, luggage organizers, and travel accessories.',
    image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString()
  }
]

const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Noise Cancelling Studio Pro',
    slug: 'noise-cancelling-studio-pro',
    description: 'Premium over-ear headphones with active noise cancellation, high-fidelity audio, and up to 40 hours of battery life.',
    price: 299.00,
    compare_price: 349.00,
    cost_price: 150.00,
    sku: 'TECH-001',
    stock_quantity: 15,
    category_id: 'e51631eb-1234-4567-89ab-cdef01234567',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop'],
    tags: ['headphones', 'audio', 'tech', 'sony', 'black', 'silver'],
    is_active: true,
    is_featured: true,
    weight: 0.35,
    metadata: { brand: 'Sony', color: 'Black, Silver', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv1-1', name: 'Matte Black', price: 299.00, stock_quantity: 10, sku: 'TECH-001-BLK', options: { color: 'Black' } },
      { id: 'pv1-2', name: 'Platinum Silver', price: 310.00, stock_quantity: 5, sku: 'TECH-001-SLV', options: { color: 'Silver' } }
    ]
  },
  {
    id: 'p2',
    name: 'Minimalist Wireless Charger',
    slug: 'minimalist-wireless-charger',
    description: 'Sleek, aluminum wireless charging pad that supports up to 15W fast charging for Qi-compatible devices.',
    price: 49.00,
    compare_price: null,
    cost_price: 20.00,
    sku: 'TECH-002',
    stock_quantity: 25,
    category_id: 'e51631eb-1234-4567-89ab-cdef01234567',
    images: ['https://images.unsplash.com/photo-1622445262465-2481c4574875?q=80&w=1000&auto=format&fit=crop'],
    tags: ['charger', 'wireless', 'tech', 'apple', 'white', 'black'],
    is_active: true,
    is_featured: true,
    weight: 0.12,
    metadata: { brand: 'Apple', color: 'White, Black', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv2-1', name: 'White', price: 49.00, stock_quantity: 15, sku: 'TECH-002-WHT', options: { color: 'White' } },
      { id: 'pv2-2', name: 'Black', price: 49.00, stock_quantity: 10, sku: 'TECH-002-BLK', options: { color: 'Black' } }
    ]
  },
  {
    id: 'p3',
    name: 'Premium Heavyweight Hoodie',
    slug: 'premium-heavyweight-hoodie',
    description: 'Crafted from 100% organic cotton, this 450GSM hoodie provides unmatched warmth, comfort, and structure.',
    price: 89.00,
    compare_price: 119.00,
    cost_price: 35.00,
    sku: 'APP-001',
    stock_quantity: 40,
    category_id: 'f61732fc-2345-5678-9abc-def012345678',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop'],
    tags: ['clothing', 'streetwear', 'hoodie', 'elite', 'slate', 's', 'm', 'l'],
    is_active: true,
    is_featured: true,
    weight: 0.85,
    metadata: { brand: 'Elite', color: 'Slate', size: 'S, M, L' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv3-1', name: 'Size S / Slate', price: 89.00, stock_quantity: 15, sku: 'APP-001-S', options: { size: 'S', color: 'Slate' } },
      { id: 'pv3-2', name: 'Size M / Slate', price: 89.00, stock_quantity: 15, sku: 'APP-001-M', options: { size: 'M', color: 'Slate' } },
      { id: 'pv3-3', name: 'Size L / Slate', price: 89.00, stock_quantity: 10, sku: 'APP-001-L', options: { size: 'L', color: 'Slate' } }
    ]
  },
  {
    id: 'p5',
    name: 'Urban Cargo Joggers',
    slug: 'urban-cargo-joggers',
    description: 'Versatile cargo pants with multiple pockets, comfortable stretch waist, and utility styling.',
    price: 79.00,
    compare_price: 99.00,
    cost_price: 30.00,
    sku: 'APP-002',
    stock_quantity: 30,
    category_id: 'f61732fc-2345-5678-9abc-def012345678',
    images: ['https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=1000&auto=format&fit=crop'],
    tags: ['clothing', 'streetwear', 'joggers', 'elite', 'grey', 'm', 'l'],
    is_active: true,
    is_featured: false,
    weight: 0.55,
    metadata: { brand: 'Elite', color: 'Grey', size: 'M, L' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv5-1', name: 'Size M / Grey', price: 79.00, stock_quantity: 15, sku: 'APP-002-M', options: { size: 'M', color: 'Grey' } },
      { id: 'pv5-2', name: 'Size L / Grey', price: 79.00, stock_quantity: 15, sku: 'APP-002-L', options: { size: 'L', color: 'Grey' } }
    ]
  },
  {
    id: 'p6',
    name: 'Classic Leather Biker Jacket',
    slug: 'classic-leather-biker-jacket',
    description: 'Premium quality full-grain black leather biker jacket with asymmetrical silver zippers.',
    price: 189.00,
    compare_price: 249.00,
    cost_price: 80.00,
    sku: 'FASH-001',
    stock_quantity: 12,
    category_id: 'a1111111-1111-1111-1111-111111111111',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop'],
    tags: ['jacket', 'leather', 'fashion', 'clothing', 'zara', 'black', 'l'],
    is_active: true,
    is_featured: true,
    weight: 1.80,
    metadata: { brand: 'Zara', color: 'Black', size: 'L' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv6-1', name: 'Size L / Black', price: 189.00, stock_quantity: 12, sku: 'FASH-001-L', options: { size: 'L', color: 'Black' } }
    ]
  },
  {
    id: 'p7',
    name: 'Minimalist Canvas Sneakers',
    slug: 'minimalist-canvas-sneakers',
    description: 'Timeless white low-top canvas sneakers with durable vulcanized rubber soles.',
    price: 65.00,
    compare_price: 79.00,
    cost_price: 25.00,
    sku: 'FASH-002',
    stock_quantity: 20,
    category_id: 'a1111111-1111-1111-1111-111111111111',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop'],
    tags: ['sneakers', 'footwear', 'shoes', 'fashion', 'converse', 'white', 'xl'],
    is_active: true,
    is_featured: false,
    weight: 0.90,
    metadata: { brand: 'Converse', color: 'White', size: 'XL' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv7-1', name: 'Size XL / White', price: 65.00, stock_quantity: 20, sku: 'FASH-002-XL', options: { size: 'XL', color: 'White' } }
    ]
  },
  {
    id: 'p4',
    name: 'RGB Mechanical Gaming Keyboard',
    slug: 'rgb-mechanical-gaming-keyboard',
    description: 'Full-featured gaming mechanical keyboard with hot-swappable red switches and customizable per-key RGB backlighting.',
    price: 149.00,
    compare_price: 179.00,
    cost_price: 65.00,
    sku: 'GAME-001',
    stock_quantity: 10,
    category_id: 'b2222222-2222-2222-2222-222222222222',
    images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop'],
    tags: ['keyboard', 'gaming', 'rgb', 'mechanical', 'logitech', 'black'],
    is_active: true,
    is_featured: true,
    weight: 1.10,
    metadata: { brand: 'Logitech', color: 'Black', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv4-1', name: 'RGB Standard', price: 149.00, stock_quantity: 10, sku: 'GAME-001-RGB', options: { color: 'Black' } }
    ]
  },
  {
    id: 'p8',
    name: 'Pro Wireless Gaming Mouse',
    slug: 'pro-wireless-gaming-mouse',
    description: 'Ultra-lightweight wireless gaming mouse with 25K DPI optical sensor and sub-millisecond response latency.',
    price: 129.00,
    compare_price: 149.00,
    cost_price: 55.00,
    sku: 'GAME-002',
    stock_quantity: 18,
    category_id: 'b2222222-2222-2222-2222-222222222222',
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop'],
    tags: ['mouse', 'gaming', 'wireless', 'accessories', 'logitech', 'black'],
    is_active: true,
    is_featured: false,
    weight: 0.08,
    metadata: { brand: 'Logitech', color: 'Black', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv8-1', name: 'Black Wireless', price: 129.00, stock_quantity: 18, sku: 'GAME-002-BLK', options: { color: 'Black' } }
    ]
  },
  {
    id: 'p9',
    name: 'Refillable Leather Journal',
    slug: 'refillable-leather-journal',
    description: 'Handcrafted brown leather notebook cover with replaceable thick acid-free grid paper inserts.',
    price: 35.00,
    compare_price: null,
    cost_price: 12.00,
    sku: 'STAT-001',
    stock_quantity: 25,
    category_id: 'c3333333-3333-3333-3333-333333333333',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop'],
    tags: ['journal', 'leather', 'stationery', 'notebook', 'moleskine', 'brown', 's'],
    is_active: true,
    is_featured: true,
    weight: 0.45,
    metadata: { brand: 'Moleskine', color: 'Brown', size: 'S' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv9-1', name: 'Brown S', price: 35.00, stock_quantity: 25, sku: 'STAT-001-BRN', options: { size: 'S', color: 'Brown' } }
    ]
  },
  {
    id: 'p10',
    name: 'Matte Black Fountain Pen',
    slug: 'matte-black-fountain-pen',
    description: 'Sleek carbon-aluminum body fountain pen with an extra-fine stainless steel nib and ink converter.',
    price: 45.00,
    compare_price: 55.00,
    cost_price: 18.00,
    sku: 'STAT-002',
    stock_quantity: 15,
    category_id: 'c3333333-3333-3333-3333-333333333333',
    images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=1000&auto=format&fit=crop'],
    tags: ['pen', 'writing', 'stationery', 'office', 'parker', 'black'],
    is_active: true,
    is_featured: false,
    weight: 0.03,
    metadata: { brand: 'Parker', color: 'Black', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv10-1', name: 'Matte Black EF', price: 45.00, stock_quantity: 15, sku: 'STAT-002-EF', options: { color: 'Black' } }
    ]
  },
  {
    id: 'p11',
    name: 'Hydrating Herbal Face Serum',
    slug: 'hydrating-herbal-face-serum',
    description: 'Enriched with organic aloe vera, green tea extracts, and hyaluronic acid for glowing hydration.',
    price: 39.00,
    compare_price: 49.00,
    cost_price: 15.00,
    sku: 'COSM-001',
    stock_quantity: 30,
    category_id: 'd4444444-4444-4444-4444-444444444444',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop'],
    tags: ['serum', 'skincare', 'cosmetics', 'beauty', 'ordinary', 'white'],
    is_active: true,
    is_featured: true,
    weight: 0.15,
    metadata: { brand: 'Ordinary', color: 'White', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv11-1', name: 'Standard Edition', price: 39.00, stock_quantity: 30, sku: 'COSM-001-STD', options: { color: 'White' } }
    ]
  },
  {
    id: 'p12',
    name: 'Luxury Sandalwood Cologne',
    slug: 'luxury-sandalwood-cologne',
    description: 'Earthy, masculine fragrance with strong notes of natural sandalwood, amber, and light bergamot.',
    price: 75.00,
    compare_price: 95.00,
    cost_price: 30.00,
    sku: 'COSM-002',
    stock_quantity: 14,
    category_id: 'd4444444-4444-4444-4444-444444444444',
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop'],
    tags: ['cologne', 'fragrance', 'cosmetics', 'beauty', 'chanel', 'blue'],
    is_active: true,
    is_featured: false,
    weight: 0.28,
    metadata: { brand: 'Chanel', color: 'Blue', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv12-1', name: 'Blue Cologne 100ml', price: 75.00, stock_quantity: 14, sku: 'COSM-002-BLU', options: { color: 'Blue' } }
    ]
  },
  {
    id: '13333333-3333-3333-3333-333333333333',
    name: 'Organic Green Tea Assortment',
    slug: 'organic-green-tea-assortment',
    description: 'An assortment of finest organic green tea blends including jasmine, mint, and pure green tea leaves.',
    price: 15.00,
    compare_price: 19.99,
    cost_price: 5.00,
    sku: 'GROC-001',
    stock_quantity: 100,
    category_id: '55555555-5555-5555-5555-555555555555',
    images: ['https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=1000&auto=format&fit=crop'],
    tags: ['grocery', 'tea', 'organic', 'green tea', 'organic india', 'green'],
    is_active: true,
    is_featured: false,
    weight: 0.20,
    metadata: { brand: 'Organic India', color: 'Green', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: '13131313-1313-1313-1313-131313131313', name: 'Green Tea Box', price: 15.00, stock_quantity: 100, sku: 'GROC-001-BOX', options: { color: 'Green' } }
    ]
  },
  {
    id: '14444444-4444-4444-4444-444444444444',
    name: 'Aesthetic Wooden Desk Organizer',
    slug: 'aesthetic-wooden-desk-organizer',
    description: 'Beautifully crafted oakwood organizer featuring slots for pens, phone holder, and storage tray.',
    price: 29.00,
    compare_price: 39.00,
    cost_price: 12.00,
    sku: 'HOME-001',
    stock_quantity: 45,
    category_id: '66666666-6666-6666-6666-666666666666',
    images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop'],
    tags: ['home', 'decor', 'organizer', 'wooden', 'elite home', 'brown'],
    is_active: true,
    is_featured: true,
    weight: 0.80,
    metadata: { brand: 'Elite Home', color: 'Brown', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: '14141414-1414-1414-1414-141414141414', name: 'Oakwood Organizer', price: 29.00, stock_quantity: 45, sku: 'HOME-001-OAK', options: { color: 'Brown' } }
    ]
  },
  {
    id: '15555555-5555-5555-5555-555555555555',
    name: 'Anti-Theft Smart Travel Backpack',
    slug: 'anti-theft-smart-travel-backpack',
    description: 'Durable, waterproof travel backpack with hidden security pockets and built-in USB charging port.',
    price: 89.00,
    compare_price: 109.00,
    cost_price: 40.00,
    sku: 'TRAV-001',
    stock_quantity: 35,
    category_id: '77777777-7777-7777-7777-777777777777',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop'],
    tags: ['travel', 'luggage', 'backpack', 'anti-theft', 'nomad', 'black'],
    is_active: true,
    is_featured: true,
    weight: 1.10,
    metadata: { brand: 'Nomad', color: 'Black', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: '15151515-1515-1515-1515-151515151515', name: 'Charcoal Black', price: 89.00, stock_quantity: 35, sku: 'TRAV-001-BLK', options: { color: 'Black' } }
    ]
  },
  {
    id: 'titan-001',
    name: 'Titan Regalia Gold Metal Watch',
    slug: 'titan-regalia-gold-metal-watch',
    description: 'Elegant gold-plated chronograph watch for men, featuring a premium metal strap, water resistance, and classic dial design.',
    price: 149.00,
    compare_price: 189.00,
    cost_price: 70.00,
    sku: 'TITA-001',
    stock_quantity: 15,
    category_id: 'a1111111-1111-1111-1111-111111111111',
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop'],
    tags: ['watch', 'titan', 'gold', 'metal', 'fashion', 'clothing'],
    is_active: true,
    is_featured: true,
    weight: 0.25,
    metadata: { brand: 'Titan', color: 'Gold', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv16-1', name: 'Gold Link Strap', price: 149.00, stock_quantity: 15, sku: 'TITA-001-GLD', options: { color: 'Gold' } }
    ]
  },
  {
    id: 'titan-002',
    name: 'Titan Raga Contemporary Ladies Watch',
    slug: 'titan-raga-contemporary-ladies-watch',
    description: 'Beautiful rose-gold designer watch for women, featuring a contemporary dial, jewelry-clasp strap, and scratch-resistant glass.',
    price: 119.00,
    compare_price: 149.00,
    cost_price: 50.00,
    sku: 'TITA-002',
    stock_quantity: 20,
    category_id: 'a1111111-1111-1111-1111-111111111111',
    images: ['https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000&auto=format&fit=crop'],
    tags: ['watch', 'titan', 'women', 'rose gold', 'fashion', 'clothing'],
    is_active: true,
    is_featured: true,
    weight: 0.18,
    metadata: { brand: 'Titan', color: 'Rose Gold', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv17-1', name: 'Rose Gold Jewelry Strap', price: 119.00, stock_quantity: 20, sku: 'TITA-002-RGLD', options: { color: 'Rose Gold' } }
    ]
  },
  {
    id: 'titan-003',
    name: 'Titan Edge Ultra-Slim Leather Watch',
    slug: 'titan-edge-ultra-slim-leather-watch',
    description: 'Ultra-slim classic dress watch featuring a minimalist black dial, sapphire crystal, and premium black leather strap.',
    price: 189.00,
    compare_price: 249.00,
    cost_price: 85.00,
    sku: 'TITA-003',
    stock_quantity: 12,
    category_id: 'a1111111-1111-1111-1111-111111111111',
    images: ['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1000&auto=format&fit=crop'],
    tags: ['watch', 'titan', 'black', 'leather', 'fashion', 'clothing'],
    is_active: true,
    is_featured: false,
    weight: 0.15,
    metadata: { brand: 'Titan', color: 'Black', size: 'One Size' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_variants: [
      { id: 'pv18-1', name: 'Black Leather Strap', price: 189.00, stock_quantity: 12, sku: 'TITA-003-BLK', options: { color: 'Black' } }
    ]
  }
]

// Add generated products to default products for large catalog testing
try {
  const generated = generateProducts(105)
  const existingIds = new Set(DEFAULT_PRODUCTS.map(p => p.id))
  for (const gp of generated) {
    if (!existingIds.has(gp.id)) {
      DEFAULT_PRODUCTS.push(gp as any)
    }
  }
} catch (e) {
  console.error('Error generating products:', e)
}

const DEFAULT_REVIEWS = [
  { id: 'r1', product_id: 'p1', user_id: '00000000-0000-0000-0000-000000000000', rating: 5, title: 'Amazing Sound!', body: 'Best headphones I have ever owned. Superb noise cancellation!', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r2', product_id: 'p1', user_id: '00000000-0000-0000-0000-000000000000', rating: 4, title: 'Very comfortable', body: 'Sound quality is premium, build is solid. Highly recommended.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r3', product_id: 'p2', user_id: '00000000-0000-0000-0000-000000000000', rating: 4, title: 'Sleek design', body: 'Charges fast and fits perfectly on my desk.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r4', product_id: 'p3', user_id: '00000000-0000-0000-0000-000000000000', rating: 5, title: 'Cozy and heavy', body: 'High quality cotton. Perfect streetwear look.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r5', product_id: 'p4', user_id: '00000000-0000-0000-0000-000000000000', rating: 5, title: 'Clicky and bright', body: 'Fascinating RGB options and very responsive keys.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r6', product_id: 'p6', user_id: '00000000-0000-0000-0000-000000000000', rating: 5, title: 'Premium leather', body: 'Fits perfectly and feels extremely premium.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r7', product_id: 'p8', user_id: '00000000-0000-0000-0000-000000000000', rating: 3, title: 'Good mouse but small', body: 'Very accurate but a bit too light for my hands.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r8', product_id: '13333333-3333-3333-3333-333333333333', user_id: '00000000-0000-0000-0000-000000000000', rating: 5, title: 'Refreshing!', body: 'Really high quality green tea leaves, jasmine flavor is fantastic.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r9', product_id: '14444444-4444-4444-4444-444444444444', user_id: '00000000-0000-0000-0000-000000000000', rating: 4, title: 'Nice aesthetic', body: 'Fits all my stationery, looks super neat on my desk.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r10', product_id: '15555555-5555-5555-5555-555555555555', user_id: '00000000-0000-0000-0000-000000000000', rating: 5, title: 'Perfect travel bag', body: 'Extremely durable. Hidden pockets are super useful.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r11', product_id: 'titan-001', user_id: '00000000-0000-0000-0000-000000000000', rating: 4, title: 'Superb regalia watch', body: 'The golden plating looks incredible. Heavy metal feel, matches premium watch standards.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r12', product_id: 'titan-001', user_id: '00000000-0000-0000-0000-000000000000', rating: 5, title: 'Classic golden titan', body: 'Beautiful gold detailing. Fully functioning dials. Gifted to my father, he loved it!', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r13', product_id: 'titan-002', user_id: '00000000-0000-0000-0000-000000000000', rating: 5, title: 'Stunning ladies watch', body: 'Contemporary styling, dial sparkles in the light. Raga is the best collection.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r14', product_id: 'titan-002', user_id: '00000000-0000-0000-0000-000000000000', rating: 4, title: 'Very elegant', body: 'Sleek band, contemporary luxury. Recommended watch for gifting.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r15', product_id: 'titan-003', user_id: '00000000-0000-0000-0000-000000000000', rating: 4, title: 'Unbelievably slim dial', body: 'Extremely light and slim dial. High quality sapphire glass and pure leather black strap.', is_verified_purchase: true, created_at: new Date().toISOString() },
  { id: 'r16', product_id: 'titan-003', user_id: '00000000-0000-0000-0000-000000000000', rating: 5, title: 'Perfect dress watch', body: 'Elegant dress watch for formal meetings. Highly recommend Titan Edge.', is_verified_purchase: true, created_at: new Date().toISOString() }
]

const DEFAULT_COUPONS = [
  {
    id: 'c1',
    code: 'SUMMERDROP20',
    type: 'percentage',
    value: 20,
    min_order_amount: 50.00,
    max_uses: 100,
    used_count: 5,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString()
  }
]

const DEFAULT_ADS = [
  {
    id: 'ad-1',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    label: 'Featured Item',
    title: 'Noise Cancelling Studio Pro',
    description: '$299.00',
    link_url: '/products/noise-cancelling-studio-pro',
    button_text: 'Buy Now',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'ad-2',
    image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop',
    label: 'Exclusive Deal',
    title: 'Minimalist Wireless Charging Pad',
    description: '$49.00 - Fast Charge Enabled',
    link_url: '/products/minimalist-wireless-charger',
    button_text: 'Shop Now',
    is_active: true,
    created_at: new Date().toISOString()
  }
]

// Helper Storage Getters / Setters
function getStorageItem(key: string, defaultVal: any) {
  const item = localStorage.getItem(key)
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultVal))
    return defaultVal
  }
  try {
    return JSON.parse(item)
  } catch (e) {
    return defaultVal
  }
}

function setStorageItem(key: string, val: any) {
  localStorage.setItem(key, JSON.stringify(val))
}

// Database Actions Initialization
export const initMockDb = () => {
  const cats = getStorageItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES)
  if (Array.isArray(cats) && cats.length < DEFAULT_CATEGORIES.length) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES))
  }

  const prods = getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS)
  const hasBrandProducts = Array.isArray(prods) && prods.some((p: any) => (p.metadata?.brand || '').toLowerCase() === "l'oreal")
  if (Array.isArray(prods) && (prods.length < DEFAULT_PRODUCTS.length || !hasBrandProducts)) {
    console.log('[mockDb] Force seeding new brand products...');
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS))
  }

  const reviews = getStorageItem(KEYS.REVIEWS, DEFAULT_REVIEWS)
  if (Array.isArray(reviews) && reviews.length < DEFAULT_REVIEWS.length) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS))
  }

  getStorageItem(KEYS.COUPONS, DEFAULT_COUPONS)
  getStorageItem(KEYS.ORDERS, [])
  getStorageItem(KEYS.ADS, DEFAULT_ADS)
  getStorageItem(KEYS.PROFILES, [
    {
      id: '00000000-0000-0000-0000-000000000000',
      full_name: 'Developer Admin',
      avatar_url: '',
      phone: '1234567890',
      role: 'admin',
      created_at: new Date().toISOString()
    }
  ])
}

// Seed Mock Db
initMockDb()

const ensureProductCategory = (p: any) => {
  if (!p) return p
  if (p.category_id) return p

  // Try to infer category based on name, description, SKU, or tags
  const nameLower = (p.name || '').toLowerCase()
  const descLower = (p.description || '').toLowerCase()
  const skuLower = (p.sku || '').toLowerCase()
  const tagsStr = (p.tags || []).join(' ').toLowerCase()

  const isGaming =
    nameLower.includes('game') || nameLower.includes('mouse') || nameLower.includes('keyboard') ||
    nameLower.includes('controller') || nameLower.includes('console') || nameLower.includes('headset') ||
    nameLower.includes('rgb') || descLower.includes('gaming') || tagsStr.includes('gaming') ||
    skuLower.startsWith('game')

  const isStationery =
    nameLower.includes('pen') || nameLower.includes('journal') || nameLower.includes('notebook') ||
    nameLower.includes('paper') || nameLower.includes('writing') || nameLower.includes('pencil') ||
    descLower.includes('stationery') || tagsStr.includes('stationery') || skuLower.startsWith('stat')

  const isCosmetics =
    nameLower.includes('serum') || nameLower.includes('beauty') || nameLower.includes('makeup') ||
    nameLower.includes('skincare') || nameLower.includes('cologne') || nameLower.includes('perfume') ||
    nameLower.includes('fragrance') || descLower.includes('cosmetics') || tagsStr.includes('cosmetics') ||
    skuLower.startsWith('cosm')

  const isApparel = 
    nameLower.includes('hoodie') || nameLower.includes('jogger') || nameLower.includes('sweatpants') ||
    nameLower.includes('t-shirt') || nameLower.includes('streetwear') || skuLower.startsWith('app') ||
    tagsStr.includes('streetwear')

  const isFashion =
    nameLower.includes('jean') || nameLower.includes('pants') || nameLower.includes('shirt') ||
    nameLower.includes('wear') || nameLower.includes('apparel') || nameLower.includes('socks') ||
    nameLower.includes('jacket') || nameLower.includes('shoe') || nameLower.includes('sneaker') ||
    descLower.includes('jean') || descLower.includes('pants') || descLower.includes('clothing') ||
    tagsStr.includes('clothing') || tagsStr.includes('fashion') || skuLower.startsWith('fash')

  if (isGaming) {
    p.category_id = 'b2222222-2222-2222-2222-222222222222' // Gaming Gear
  } else if (isStationery) {
    p.category_id = 'c3333333-3333-3333-3333-333333333333' // Stationery & Office
  } else if (isCosmetics) {
    p.category_id = 'd4444444-4444-4444-4444-444444444444' // Cosmetics & Beauty
  } else if (isApparel) {
    p.category_id = 'f61732fc-2345-5678-9abc-def012345678' // Street Apparel
  } else if (isFashion) {
    p.category_id = 'a1111111-1111-1111-1111-111111111111' // Fashion & Clothing
  } else {
    p.category_id = 'e51631eb-1234-4567-89ab-cdef01234567' // Tech & Devices
  }

  return p
}

export const mockDb = {
  // --- CATEGORIES ---
  getCategories: () => {
    return getStorageItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES)
  },

  // --- PRODUCTS ---
  getProducts: (filters: any = {}) => {
    let list = getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS) as any[]
    
    console.log('[mockDb] getProducts: Read list from LocalStorage.', {
      totalInStorage: list.length,
      productNames: list.map(p => p.name),
      filters
    })

    // Ensure all products are auto-categorized if they lack category_id
    list = list.map(ensureProductCategory)

    // filter active unless admin
    list = list.filter(p => p.is_active !== false)

    if (filters.categoryId) {
      list = list.filter(p => p.category_id === filters.categoryId)
    }
    if (filters.minPrice !== undefined) {
      list = list.filter(p => p.price >= filters.minPrice)
    }
    if (filters.maxPrice !== undefined) {
      list = list.filter(p => p.price <= filters.maxPrice)
    }
    if (filters.search) {
      const searchWords = filters.search.toLowerCase().split(/\s+/).filter(Boolean)
      list = list.filter(p => {
        const nameLower = p.name.toLowerCase()
        const descLower = p.description.toLowerCase()
        const tagsStr = (p.tags || []).join(' ').toLowerCase()
        const brand = (p.metadata?.brand || '').toLowerCase()
        return searchWords.every((word: string) =>
          nameLower.includes(word) ||
          descLower.includes(word) ||
          tagsStr.includes(word) ||
          brand.includes(word)
        )
      })
    }

    // Brand filter
    if (filters.brand) {
      const brands = (Array.isArray(filters.brand) ? filters.brand : filters.brand.split(',')).map((b: string) => b.trim().toLowerCase())
      if (brands.length > 0) {
        list = list.filter(p => {
          const pBrand = (p.metadata?.brand || '').toLowerCase()
          const tags = (p.tags || []).map((t: string) => t.toLowerCase())
          return brands.some((b: string) => pBrand === b || p.name.toLowerCase().includes(b) || tags.includes(b))
        })
      }
    }

    // Color filter
    if (filters.color) {
      const colors = (Array.isArray(filters.color) ? filters.color : filters.color.split(',')).map((c: string) => c.trim().toLowerCase())
      if (colors.length > 0) {
        list = list.filter(p => {
          const pColors = (p.metadata?.color || '').split(',').map((c: string) => c.trim().toLowerCase())
          const tags = (p.tags || []).map((t: string) => t.toLowerCase())
          const hasVariantColor = (p.product_variants || []).some((v: any) => {
            const vColor = (v.options?.color || '').toLowerCase()
            return colors.some((c: string) => v.name.toLowerCase().includes(c) || vColor === c)
          })
          return colors.some((c: string) => pColors.includes(c) || tags.includes(c) || p.name.toLowerCase().includes(c)) || hasVariantColor
        })
      }
    }

    // Size filter
    if (filters.size) {
      const sizes = (Array.isArray(filters.size) ? filters.size : filters.size.split(',')).map((s: string) => s.trim().toLowerCase())
      if (sizes.length > 0) {
        list = list.filter(p => {
          const pSizes = (p.metadata?.size || '').split(',').map((s: string) => s.trim().toLowerCase())
          const tags = (p.tags || []).map((t: string) => t.toLowerCase())
          const hasVariantSize = (p.product_variants || []).some((v: any) => {
            const vSize = (v.options?.size || '').toLowerCase()
            return sizes.some((s: string) => {
              const vNameLower = v.name.toLowerCase()
              return vNameLower.split('/').some((part: string) => part.trim() === s || part.trim() === `size ${s}`) || vSize === s
            })
          })
          return sizes.some((s: string) => pSizes.includes(s) || tags.includes(s)) || hasVariantSize
        })
      }
    }

    // Rating filter
    const reviews = getStorageItem(KEYS.REVIEWS, DEFAULT_REVIEWS) as any[]
    const getProductAvgRating = (prodId: string) => {
      const pReviews = reviews.filter(r => r.product_id === prodId)
      if (pReviews.length === 0) return 0
      return pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length
    }

    if (filters.rating !== undefined) {
      list = list.filter(p => getProductAvgRating(p.id) >= Number(filters.rating))
    }

    // Sort
    if (filters.sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price)
    } else if (filters.sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price)
    } else if (filters.sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (filters.sortBy === 'rating') {
      list.sort((a, b) => getProductAvgRating(b.id) - getProductAvgRating(a.id))
    }

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 12
    const totalCount = list.length
    const totalPages = Math.ceil(totalCount / limit)
    const paginated = list.slice((page - 1) * limit, page * limit)

    console.log('[mockDb] getProducts: Returning paginated results.', {
      returnedCount: paginated.length,
      totalCount,
      totalPages
    })

    return {
      data: paginated,
      count: totalCount,
      page,
      totalPages
    }
  },

  getProductBySlug: (slug: string) => {
    const list = getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS) as any[]
    const found = list.find(p => p.slug === slug)
    return found ? ensureProductCategory(found) : null
  },

  getFeaturedProducts: () => {
    const list = getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS) as any[]
    return list.map(ensureProductCategory).filter(p => p.is_featured && p.is_active !== false).slice(0, 8)
  },

  createProduct: (data: any) => {
    const list = getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS) as any[]
    let newProduct = {
      ...data,
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product_variants: data.variants ? data.variants.map((v: any, index: number) => ({
        ...v,
        id: `pv_new_${index}_` + Math.random().toString(36).substr(2, 5)
      })) : []
    }
    newProduct = ensureProductCategory(newProduct)
    list.push(newProduct)
    setStorageItem(KEYS.PRODUCTS, list)
    console.log('[mockDb] createProduct successful. New count in LocalStorage:', list.length, 'Products:', list.map(p => p.name))
    return newProduct
  },

  updateProduct: (id: string, data: any) => {
    const list = getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS) as any[]
    const idx = list.findIndex(p => p.id === id)
    if (idx > -1) {
      let updatedProduct = {
        ...list[idx],
        ...data,
        updated_at: new Date().toISOString(),
        product_variants: data.variants ? data.variants.map((v: any, index: number) => ({
          ...v,
          id: v.id || `pv_up_${index}_` + Math.random().toString(36).substr(2, 5)
        })) : []
      }
      updatedProduct = ensureProductCategory(updatedProduct)
      list[idx] = updatedProduct
      setStorageItem(KEYS.PRODUCTS, list)
      return { success: true }
    }
    throw new Error('Product not found')
  },

  deleteProduct: (id: string) => {
    let list = getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS) as any[]
    list = list.filter(p => p.id !== id)
    setStorageItem(KEYS.PRODUCTS, list)
    return { success: true }
  },

  // --- ORDERS ---
  createOrder: (data: any) => {
    const list = getStorageItem(KEYS.ORDERS, []) as any[]
    const newOrder = {
      ...data,
      id: 'o_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'pending',
      payment_status: 'pending',
      shipping_address: data.shippingAddress
    }
    list.push(newOrder)
    setStorageItem(KEYS.ORDERS, list)
    return newOrder
  },

  getOrderById: (id: string) => {
    const list = getStorageItem(KEYS.ORDERS, []) as any[]
    const order = list.find(o => o.id === id)
    if (order) {
      // Mock order items list product join
      const prodList = getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS) as any[]
      const orderItems = order.items.map((item: any) => {
        const prod = prodList.find(p => p.id === item.productId)
        return {
          ...item,
          products: prod ? { name: prod.name, slug: prod.slug, images: prod.images } : null
        }
      })
      return { ...order, order_items: orderItems }
    }
    return null
  },

  getUserOrders: (userId: string) => {
    const list = getStorageItem(KEYS.ORDERS, []) as any[]
    return list.filter(o => o.user_id === userId)
  },

  getAdminOrders: () => {
    const list = getStorageItem(KEYS.ORDERS, []) as any[]
    const profiles = getStorageItem(KEYS.PROFILES, []) as any[]
    return list.map(order => {
      const prof = profiles.find(p => p.id === order.user_id)
      return {
        ...order,
        profiles: prof ? { full_name: prof.full_name, phone: prof.phone } : null
      }
    })
  },

  updateOrderStatus: (id: string, status: string, returnReason?: string) => {
    const list = getStorageItem(KEYS.ORDERS, []) as any[]
    const idx = list.findIndex(o => o.id === id)
    if (idx > -1) {
      list[idx].status = status
      if (returnReason) {
        list[idx].return_reason = returnReason
      }
      setStorageItem(KEYS.ORDERS, list)
      return { success: true }
    }
    throw new Error('Order not found')
  },

  // --- REVIEWS ---
  addReview: (reviewData: any) => {
    const list = getStorageItem(KEYS.REVIEWS, []) as any[]
    const newReview = {
      ...reviewData,
      id: 'r_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      is_verified_purchase: true
    }
    list.push(newReview)
    setStorageItem(KEYS.REVIEWS, list)
    return { success: true, review: newReview }
  },

  getProductReviews: (productId: string) => {
    const list = getStorageItem(KEYS.REVIEWS, []) as any[]
    const profiles = getStorageItem(KEYS.PROFILES, []) as any[]
    const filtered = list.filter(r => r.product_id === productId)
    return filtered.map(r => {
      const prof = profiles.find(p => p.id === r.user_id)
      return {
        ...r,
        profiles: prof ? { full_name: prof.full_name, avatar_url: prof.avatar_url } : { full_name: 'Anonymous User', avatar_url: '' }
      }
    })
  },

  // --- COUPONS ---
  validateCoupon: (code: string, subtotal: number) => {
    const list = getStorageItem(KEYS.COUPONS, DEFAULT_COUPONS) as any[]
    const coupon = list.find(c => c.code.toUpperCase() === code.toUpperCase() && c.is_active)
    if (!coupon) {
      return { success: false, message: 'Invalid or expired coupon code' }
    }
    if (subtotal < coupon.min_order_amount) {
      return { success: false, message: `Minimum order amount of $${coupon.min_order_amount} required` }
    }
    let discountAmount = 0
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100
    } else {
      discountAmount = coupon.value
    }
    discountAmount = Math.min(discountAmount, subtotal)
    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_order_amount: coupon.min_order_amount
      },
      discountAmount
    }
  },

  getCoupons: () => {
    return getStorageItem(KEYS.COUPONS, DEFAULT_COUPONS)
  },

  createCoupon: (data: any) => {
    const list = getStorageItem(KEYS.COUPONS, DEFAULT_COUPONS) as any[]
    const newCoupon = {
      ...data,
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    }
    list.push(newCoupon)
    setStorageItem(KEYS.COUPONS, list)
    return newCoupon
  },

  deleteCoupon: (id: string) => {
    let list = getStorageItem(KEYS.COUPONS, DEFAULT_COUPONS) as any[]
    list = list.filter(c => c.id !== id)
    setStorageItem(KEYS.COUPONS, list)
    return { success: true }
  },

  // --- ADMIN CUSTOMERS ---
  getCustomersList: () => {
    return getStorageItem(KEYS.PROFILES, [])
  },

  // --- DASHBOARD ANALYTICS ---
  getDashboardStats: () => {
    const orders = getStorageItem(KEYS.ORDERS, []) as any[]
    const profiles = getStorageItem(KEYS.PROFILES, []) as any[]
    const products = getStorageItem(KEYS.PRODUCTS, DEFAULT_PRODUCTS) as any[]

    const paidOrders = orders.filter(o => o.payment_status === 'paid' || o.status === 'confirmed' || o.status === 'delivered')
    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const ordersCount = orders.length
    const customersCount = profiles.length
    const productsCount = products.length
    const averageOrderValue = ordersCount > 0 ? (revenue / ordersCount) : 0

    return {
      revenue,
      ordersCount,
      customersCount,
      productsCount,
      averageOrderValue
    }
  },

  getSalesData: () => {
    const orders = getStorageItem(KEYS.ORDERS, []) as any[]
    const paidOrders = orders.filter(o => o.payment_status === 'paid' || o.status === 'confirmed' || o.status === 'delivered')
    
    const groups: { [key: string]: number } = {}
    paidOrders.forEach(order => {
      const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      groups[dateStr] = (groups[dateStr] || 0) + Number(order.total)
    })

    return Object.keys(groups).map(date => ({
      date,
      sales: groups[date]
    }))
  },

  // --- ADVERTISEMENTS ---
  getAdvertisements: () => {
    return getStorageItem(KEYS.ADS, DEFAULT_ADS)
  },

  createAdvertisement: (data: any) => {
    const list = getStorageItem(KEYS.ADS, DEFAULT_ADS) as any[]
    const newAd = {
      ...data,
      id: 'ad_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    }
    list.push(newAd)
    setStorageItem(KEYS.ADS, list)
    return newAd
  },

  updateAdvertisement: (id: string, data: any) => {
    const list = getStorageItem(KEYS.ADS, DEFAULT_ADS) as any[]
    const idx = list.findIndex(ad => ad.id === id)
    if (idx > -1) {
      list[idx] = {
        ...list[idx],
        ...data,
        updated_at: new Date().toISOString()
      }
      setStorageItem(KEYS.ADS, list)
      return { success: true }
    }
    throw new Error('Advertisement not found')
  },

  deleteAdvertisement: (id: string) => {
    let list = getStorageItem(KEYS.ADS, DEFAULT_ADS) as any[]
    list = list.filter(ad => ad.id !== id)
    setStorageItem(KEYS.ADS, list)
    return { success: true }
  }
}
