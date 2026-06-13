import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateProducts } from './lib/utils/seedHelper';

// Parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Seeding Supabase at:', supabaseUrl);

  // 1. Seed Categories
  const categoriesData = [
    {
      id: 'e51631eb-1234-4567-89ab-cdef01234567',
      name: 'Tech & Devices',
      slug: 'tech-devices',
      description: 'Minimalist desk accessories, charging bricks, and mechanical keys.',
      image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 'f61732fc-2345-5678-9abc-def012345678',
      name: 'Street Apparel',
      slug: 'street-apparel',
      description: 'Premium quality hoodies, sweatpants, and everyday wear essentials.',
      image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      name: 'Fashion & Clothing',
      slug: 'fashion',
      description: 'Trendy streetwear, stylish jackets, luxury wear, and footwear.',
      image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      name: 'Gaming Gear',
      slug: 'gaming',
      description: 'High-performance mechanical keyboards, precision mice, and gaming setups.',
      image_url: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 'c3333333-3333-3333-3333-333333333333',
      name: 'Stationery & Office',
      slug: 'stationery',
      description: 'Premium journals, leather notebooks, elegant writing instruments, and desk organizers.',
      image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 'd4444444-4444-4444-4444-444444444444',
      name: 'Cosmetics & Beauty',
      slug: 'cosmetics',
      description: 'Organic skincare products, luxury perfumes, and beauty essentials.',
      image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      name: 'Grocery & Pantry',
      slug: 'grocery',
      description: 'Organic foods, beverages, and household pantry items.',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      name: 'Home & Decor',
      slug: 'home',
      description: 'Aesthetic lighting, desk accents, organizers, and furniture pieces.',
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: '77777777-7777-7777-7777-777777777777',
      name: 'Travel & Luggage',
      slug: 'travel',
      description: 'Anti-theft smart bags, luggage organizers, and travel accessories.',
      image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop'
    }
  ];

  const { error: catError } = await supabase
    .from('categories')
    .upsert(categoriesData as any, { onConflict: 'id' });

  if (catError) {
    console.error('Error seeding categories:', catError);
    return;
  }
  console.log('Categories seeded successfully!');

  // 2. Seed Products
  const generated = generateProducts(105);
  const manualProducts = [
    {
      id: '1e51631e-1234-4567-89ab-cdef01234567',
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
      metadata: { brand: 'Sony', color: 'Black, Silver', size: 'One Size' }
    },
    {
      id: '2e51631e-1234-4567-89ab-cdef01234567',
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
      metadata: { brand: 'Apple', color: 'White, Black', size: 'One Size' }
    },
    {
      id: '3f61732f-2345-5678-9abc-def012345678',
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
      metadata: { brand: 'Elite', color: 'Slate', size: 'S, M, L' }
    },
    {
      id: '5f61732f-2345-5678-9abc-def012345678',
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
      metadata: { brand: 'Elite', color: 'Grey', size: 'M, L' }
    },
    {
      id: '6a111111-1111-1111-1111-111111111111',
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
      metadata: { brand: 'Zara', color: 'Black', size: 'L' }
    },
    {
      id: '7a111111-1111-1111-1111-111111111111',
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
      metadata: { brand: 'Converse', color: 'White', size: 'XL' }
    },
    {
      id: '4b222222-2222-2222-2222-222222222222',
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
      metadata: { brand: 'Logitech', color: 'Black', size: 'One Size' }
    },
    {
      id: '8b222222-2222-2222-2222-222222222222',
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
      metadata: { brand: 'Logitech', color: 'Black', size: 'One Size' }
    },
    {
      id: '9c333333-3333-3333-3333-333333333333',
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
      metadata: { brand: 'Moleskine', color: 'Brown', size: 'S' }
    },
    {
      id: '10c33333-3333-3333-3333-333333333333',
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
      metadata: { brand: 'Parker', color: 'Black', size: 'One Size' }
    },
    {
      id: '11d44444-4444-4444-4444-444444444444',
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
      metadata: { brand: 'Ordinary', color: 'White', size: 'One Size' }
    },
    {
      id: '12d44444-4444-4444-4444-444444444444',
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
      metadata: { brand: 'Chanel', color: 'Blue', size: 'One Size' }
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
      metadata: { brand: 'Organic India', color: 'Green', size: 'One Size' }
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
      images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?q=1000&w=1000&auto=format&fit=crop'],
      tags: ['home', 'decor', 'organizer', 'wooden', 'elite home', 'brown'],
      is_active: true,
      is_featured: true,
      weight: 0.80,
      metadata: { brand: 'Elite Home', color: 'Brown', size: 'One Size' }
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
      metadata: { brand: 'Nomad', color: 'Black', size: 'One Size' }
    }
  ];

  const allProducts = [...manualProducts];
  const existingIds = new Set(manualProducts.map(p => p.id));
  for (const gp of generated) {
    if (!existingIds.has(gp.id)) {
      allProducts.push(gp as any);
    }
  }

  const productsToUpsert = allProducts.map((p: any) => {
    const { product_variants, ...rest } = p;
    return {
      ...rest,
      created_at: rest.created_at || new Date().toISOString(),
      updated_at: rest.updated_at || new Date().toISOString()
    };
  });

  const { error: prodError } = await supabase
    .from('products')
    .upsert(productsToUpsert as any, { onConflict: 'id' });

  if (prodError) {
    console.error('Error seeding products:', prodError);
    return;
  }
  console.log(`Successfully seeded ${productsToUpsert.length} products!`);

  // 3. Seed Product Variants
  const manualVariants = [
    { id: '11e51631-1234-4567-89ab-cdef01234567', product_id: '1e51631e-1234-4567-89ab-cdef01234567', name: 'Matte Black', price: 299.00, stock_quantity: 10, sku: 'TECH-001-BLK', options: { color: 'Black' } },
    { id: '12e51631-1234-4567-89ab-cdef01234567', product_id: '1e51631e-1234-4567-89ab-cdef01234567', name: 'Platinum Silver', price: 310.00, stock_quantity: 5, sku: 'TECH-001-SLV', options: { color: 'Silver' } },
    { id: '31f61732-2345-5678-9abc-def012345678', product_id: '3f61732f-2345-5678-9abc-def012345678', name: 'Size S / Slate', price: 89.00, stock_quantity: 15, sku: 'APP-001-S', options: { size: 'S', color: 'Slate' } },
    { id: '32f61732-2345-5678-9abc-def012345678', product_id: '3f61732f-2345-5678-9abc-def012345678', name: 'Size M / Slate', price: 89.00, stock_quantity: 15, sku: 'APP-001-M', options: { size: 'M', color: 'Slate' } },
    { id: '33f61732-2345-5678-9abc-def012345678', product_id: '3f61732f-2345-5678-9abc-def012345678', name: 'Size L / Slate', price: 89.00, stock_quantity: 10, sku: 'APP-001-L', options: { size: 'L', color: 'Slate' } },
    { id: '13131313-1313-1313-1313-131313131313', product_id: '13333333-3333-3333-3333-333333333333', name: 'Green Tea Box', price: 15.00, stock_quantity: 100, sku: 'GROC-001-BOX', options: { color: 'Green' } },
    { id: '14141414-1414-1414-1414-141414141414', product_id: '14444444-4444-4444-4444-444444444444', name: 'Oakwood Organizer', price: 29.00, stock_quantity: 45, sku: 'HOME-001-OAK', options: { color: 'Brown' } },
    { id: '15151515-1515-1515-1515-151515151515', product_id: '15555555-5555-5555-5555-555555555555', name: 'Charcoal Black', price: 89.00, stock_quantity: 35, sku: 'TRAV-001-BLK', options: { color: 'Black' } }
  ];

  const allVariants: any[] = [...manualVariants];
  const existingVarIds = new Set(manualVariants.map(v => v.id));

  for (const p of allProducts as any[]) {
    if (p.product_variants) {
      for (const v of p.product_variants) {
        if (!existingVarIds.has(v.id)) {
          allVariants.push({
            id: v.id,
            product_id: p.id,
            name: v.name,
            price: v.price,
            stock_quantity: v.stock_quantity,
            sku: v.sku,
            options: v.options || {}
          });
        }
      }
    }
  }

  const { error: varError } = await supabase
    .from('product_variants')
    .upsert(allVariants as any, { onConflict: 'id' });

  if (varError) {
    console.error('Error seeding variants:', varError);
    return;
  }
  console.log(`Successfully seeded ${allVariants.length} product variants!`);

  // 4. Seed Coupons
  const couponsData = [
    {
      id: '1c11631e-1234-4567-89ab-cdef01234567',
      code: 'SUMMERDROP20',
      type: 'percentage',
      value: 20,
      min_order_amount: 50.00,
      max_uses: 100,
      used_count: 5,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    }
  ];

  const { error: coupError } = await supabase
    .from('coupons')
    .upsert(couponsData as any, { onConflict: 'id' });

  if (coupError) {
    console.error('Error seeding coupons:', coupError);
    return;
  }
  console.log('Coupons seeded successfully!');
  console.log('Database seeding complete!');
}

run();
