// Utility to generate realistic products programmatically for database seeding

export interface ProductVariant {
  id: string
  product_id?: string
  name: string
  price: number
  stock_quantity: number
  sku: string
  options: Record<string, string>
}

export interface GeneratedProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_price: number | null
  cost_price: number
  sku: string
  stock_quantity: number
  category_id: string
  images: string[]
  tags: string[]
  is_active: boolean
  is_featured: boolean
  weight: number
  metadata: {
    brand: string
    color: string
    size: string
    [key: string]: any
  }
  created_at: string
  updated_at: string
  product_variants: ProductVariant[]
}

const CATEGORY_CONFIGS: Record<string, {
  id: string
  name: string
  adjectives: string[]
  nouns: string[]
  brands: string[]
  images: string[]
  tags: string[]
  colors: string[]
  sizes: string[]
}> = {
  'tech-devices': {
    id: 'e51631eb-1234-4567-89ab-cdef01234567',
    name: 'Tech & Devices',
    adjectives: ['Aesthetic', 'Minimalist', 'Cyber', 'Wireless', 'Ergonomic', 'Smart', 'Portable', 'NextGen', 'Pro', 'Pocket'],
    nouns: ['Charging Brick', 'Desk Mat', 'Mechanical Keyboard', 'USB Hub', 'Laptop Stand', 'LED Light Strip', 'Desk Lamp', 'Cable Organizer', 'Headphone Stand', 'Trackpad'],
    brands: ['Anker', 'Logi', 'Keychron', 'Nomad', 'Razer'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622445262465-2481c4574875?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['headphones', 'audio', 'tech', 'accessories', 'minimalist'],
    colors: ['Black', 'Silver', 'Slate Grey', 'Matte White'],
    sizes: ['One Size']
  },
  'street-apparel': {
    id: 'f61732fc-2345-5678-9abc-def012345678',
    name: 'Street Apparel',
    adjectives: ['Premium', 'Heavyweight', 'Cozy', 'Urban', 'Vintage', 'Graphic', 'Oversized', 'Distressed', 'Fleece', 'Windproof'],
    nouns: ['Hoodie', 'Sweatpants', 'Cargo Pants', 'T-Shirt', 'Coach Jacket', 'Beanie', 'Socks', 'Windbreaker', 'Joggers', 'Crewneck'],
    brands: ['Elite', 'Essentials', 'Champion', 'Stussy', 'Carhartt'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['clothing', 'streetwear', 'apparel', 'cozy', 'fashion'],
    colors: ['Jet Black', 'Heather Grey', 'Olive Green', 'Beige', 'Navy Blue'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  'fashion': {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Fashion & Clothing',
    adjectives: ['Classic', 'Luxury', 'Slim-Fit', 'Leather', 'Wool', 'Silk', 'Tailored', 'Trench', 'Casual', 'Smart'],
    nouns: ['Biker Jacket', 'Canvas Sneakers', 'Denim Jeans', 'Dress Shirt', 'Blazer', 'Oxford Shoes', 'Trench Coat', 'Cashmere Sweater', 'Leather Belt', 'Loafers'],
    brands: ['Zara', 'Converse', 'Levis', 'Hugo Boss', 'Ralph Lauren'],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['jacket', 'fashion', 'clothing', 'luxury', 'classic'],
    colors: ['Black', 'Tan Brown', 'White', 'Charcoal', 'Burgundy'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  'gaming': {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Gaming Gear',
    adjectives: ['RGB', 'Wireless', 'Ultra-Light', 'Mechanical', 'Surround-Sound', 'Curved', 'Ergonomic', 'Pro-Grip', 'Precision', 'Silent'],
    nouns: ['Gaming Mouse', 'Mechanical Keyboard', 'Gaming Headset', 'Mouse Pad', 'Monitor Stand', 'Controller', 'VR Headset', 'Flight Stick', 'Capture Card', 'Streaming Mic'],
    brands: ['Razer', 'Logitech', 'Corsair', 'SteelSeries', 'HyperX'],
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600086880633-c96d5b85a73b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['keyboard', 'gaming', 'rgb', 'mechanical', 'precision'],
    colors: ['RGB Edition', 'Classic Black', 'Arctic White', 'Neon Pink'],
    sizes: ['One Size']
  },
  'stationery': {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Stationery & Office',
    adjectives: ['Refillable', 'Fountain', 'Leather', 'Hardcover', 'Bullet', 'Fine-Tip', 'Brass', 'Elegant', 'Grid', 'Textured'],
    nouns: ['Journal', 'Fountain Pen', 'Desk Organizer', 'Notebook', 'Planner', 'Pen Holder', 'Sketchbook', 'Sticky Notes', 'Calligraphy Set', 'Paperweight'],
    brands: ['Moleskine', 'Parker', 'Lamy', 'Rhodia', 'Midori'],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['journal', 'leather', 'stationery', 'office', 'writing'],
    colors: ['Mahogany Brown', 'Midnight Black', 'Forest Green', 'Tan Leather'],
    sizes: ['A5 Size', 'Pocket Size', 'A4 Desk Size']
  },
  'cosmetics': {
    id: 'd4444444-4444-4444-4444-444444444444',
    name: 'Cosmetics & Beauty',
    adjectives: ['Hydrating', 'Herbal', 'Organic', 'Exfoliating', 'Natural', 'Soothing', 'Anti-Aging', 'Matte', 'Fragrant', 'Glowing'],
    nouns: ['Face Serum', 'Sandalwood Cologne', 'Clay Mask', 'Lip Balm', 'Moisturizer', 'Sunscreen', 'Facial Cleanser', 'Perfume', 'Hand Cream', 'Toner'],
    brands: ['Ordinary', 'Chanel', 'Kiehls', 'Aesop', 'CeraVe'],
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['skincare', 'cosmetics', 'beauty', 'fragrance', 'natural'],
    colors: ['Natural', 'Scented', 'Unscented'],
    sizes: ['50ml', '100ml', '200ml']
  },
  'grocery': {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Grocery & Pantry',
    adjectives: ['Organic', 'Green', 'Roasted', 'Whole-Grain', 'Gluten-Free', 'Sparkling', 'Cold-Pressed', 'Artisanal', 'Premium', 'Spicy'],
    nouns: ['Tea Assortment', 'Coffee Beans', 'Almond Butter', 'Granola', 'Olive Oil', 'Maple Syrup', 'Dark Chocolate', 'Organic Honey', 'Coconut Water', 'Quinoa'],
    brands: ['Organic India', 'Blue Tokai', 'Kirkland', 'PureSource', 'WholeFoods'],
    images: [
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['grocery', 'organic', 'healthy', 'pantry', 'fresh'],
    colors: ['Default Pack', 'Family Pack', 'Eco Refill'],
    sizes: ['250g', '500g', '1kg']
  },
  'home': {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Home & Decor',
    adjectives: ['Wooden', 'Aesthetic', 'Ceramic', 'Woolen', 'Minimalist', 'Vintage', 'Aromatherapy', 'Abstract', 'Hand-Woven', 'Ambient'],
    nouns: ['Desk Organizer', 'Scented Candle', 'Ceramic Vase', 'Throw Blanket', 'Cushion Cover', 'Wall Art Frame', 'Jute Rug', 'Table Lamp', 'Metal Bookends', 'Stone Coasters'],
    brands: ['Elite Home', 'West Elm', 'MUJI', 'IKEA', 'HM Home'],
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['decor', 'home', 'furniture', 'lighting', 'organizer'],
    colors: ['Oak Wood', 'Beige Wool', 'Ceramic White', 'Terrazzo'],
    sizes: ['Standard Size', 'Large', 'Mini']
  },
  'travel': {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Travel & Luggage',
    adjectives: ['Anti-Theft', 'Smart', 'Waterproof', 'Carry-On', 'Expandable', 'Compression', 'Lightweight', 'TSA-Approved', 'Durable', 'Ergonomic'],
    nouns: ['Backpack', 'Duffle Bag', 'Packing Cubes', 'Passport Wallet', 'Luggage Tag', 'Toiletry Pouch', 'Neck Pillow', 'Compact Powerbank', 'TSA Cable Lock', 'Tech Organizer Case'],
    brands: ['Nomad', 'Samsonite', 'Peak Design', 'Tumi', 'Herschel'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop'
    ],
    tags: ['travel', 'bag', 'backpack', 'anti-theft', 'organizer'],
    colors: ['Stealth Black', 'Charcoal', 'Navy Blue', 'Olive Drab'],
    sizes: ['20L Daily', '40L Travel', 'One Size']
  }
}

// Generate deterministic UUIDs based on category name and index
function generateUUID(categorySlug: string, index: number): string {
  let hash = 0
  const str = `${categorySlug}-${index}`
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const hex = Math.abs(hash).toString(16).padEnd(8, '0').slice(0, 8)
  const indexHex = index.toString(16).padStart(12, '0').slice(0, 12)
  return `${hex}-1234-4567-89ab-${indexHex}`
}

export function generateProducts(count: number = 105): GeneratedProduct[] {
  const productsList: GeneratedProduct[] = []

  for (const [slug, cfg] of Object.entries(CATEGORY_CONFIGS)) {
    for (let i = 1; i <= count; i++) {
      const adjective = cfg.adjectives[(i - 1) % cfg.adjectives.length]
      const noun = cfg.nouns[(i - 1) % cfg.nouns.length]
      const brand = cfg.brands[(i - 1) % cfg.brands.length]
      const color = cfg.colors[(i - 1) % cfg.colors.length]
      const size = cfg.sizes[(i - 1) % cfg.sizes.length]
      
      const productId = generateUUID(slug, i)
      const name = `${brand} ${adjective} ${noun}`
      const productSlug = `${slug}-${brand.toLowerCase()}-${adjective.toLowerCase()}-${noun.toLowerCase().replace(/\s+/g, '-')}-${i}`
      
      // Calculate realistic pricing
      // Base pricing varies based on noun index to prevent identical prices
      const baseMultiplier = 15 + ((i * 7) % 180)
      const price = Number(baseMultiplier.toFixed(2))
      const compare_price = i % 3 === 0 ? Number((price * 1.25).toFixed(2)) : null
      const cost_price = Number((price * 0.45).toFixed(2))
      
      const sku = `${slug.slice(0, 4).toUpperCase()}-${String(i).padStart(3, '0')}-${brand.slice(0, 3).toUpperCase()}`
      const stock_quantity = 10 + ((i * 13) % 95)
      
      const images = [cfg.images[(i - 1) % cfg.images.length]]
      const tags = [...new Set([...cfg.tags, brand.toLowerCase(), color.toLowerCase(), adjective.toLowerCase()])]
      
      const is_featured = i <= 3 // Make first 3 items in each category featured
      
      // Generate 2 product variants for color/size options
      const product_variants: ProductVariant[] = [
        {
          id: generateUUID(`var-${productId}`, 1),
          product_id: productId,
          name: `${color} / ${size}`,
          price: price,
          stock_quantity: Math.floor(stock_quantity / 2),
          sku: `${sku}-01`,
          options: { color, size }
        },
        {
          id: generateUUID(`var-${productId}`, 2),
          product_id: productId,
          name: `${color} Special Edition`,
          price: Number((price * 1.1).toFixed(2)),
          stock_quantity: Math.floor(stock_quantity / 2),
          sku: `${sku}-02`,
          options: { color, size, edition: 'Special' }
        }
      ]

      productsList.push({
        id: productId,
        name,
        slug: productSlug,
        description: `Premium quality ${noun} by ${brand}. Features a ${adjective.toLowerCase()} design crafted for durability, functionality, and outstanding aesthetics. Suitable for both professional use and everyday lifestyle integration. Built from ethically sourced materials.`,
        price,
        compare_price,
        cost_price,
        sku,
        stock_quantity,
        category_id: cfg.id,
        images,
        tags,
        is_active: true,
        is_featured,
        weight: Number((0.1 + ((i * 0.15) % 2.5)).toFixed(2)),
        metadata: {
          brand,
          color,
          size
        },
        created_at: new Date(Date.now() - i * 3600 * 1000).toISOString(), // distribute creation times
        updated_at: new Date().toISOString(),
        product_variants
      })
    }
  }

  // Generate brand-specific products (exactly 20 per brand with proper specifications)
  const specialBrands = [
    {
      name: 'Sony',
      categoryId: 'e51631eb-1234-4567-89ab-cdef01234567', // Tech & Devices
      categorySlug: 'tech-devices',
      nouns: [
        { name: 'Wireless Headphones', specs: { Type: 'Over-Ear', Connectivity: 'Bluetooth 5.2, Wired', Noise_Cancelling: 'Yes (Active)', Driver_Size: '40mm' } },
        { name: 'ANC Earbuds', specs: { Type: 'In-Ear', Connectivity: 'Bluetooth 5.3', Noise_Cancelling: 'Yes (Active)', Water_Resistance: 'IPX4' } },
        { name: 'Dolby Soundbar', specs: { Type: 'Home Audio', Channels: '7.1.2 Dolby Atmos', Connectivity: 'HDMI eARC, Bluetooth' } },
        { name: 'Bluetooth Speaker', specs: { Type: 'Portable Speaker', Water_Resistance: 'IP67', Connectivity: 'Bluetooth 5.2' } },
        { name: 'Hi-Res Walkman', specs: { Type: 'Hi-Res Digital Audio Player', OS: 'Android 12', Connectivity: 'Wi-Fi, Bluetooth' } },
        { name: 'Vlog Camera', specs: { Type: 'Mirrorless Vlog Camera', Sensor: 'APS-C CMOS', Resolution: '24.2 MP', Video_Quality: '4K 30p' } },
        { name: 'G-Master Camera Lens', specs: { Type: 'Zoom Lens', Mount: 'E-mount', Aperture: 'f/2.8 Constant' } },
        { name: 'Studio Monitor', specs: { Type: 'Over-Ear Studio Monitor', Connectivity: 'Wired (3.5mm)', Impedance: '63 Ohms' } },
        { name: 'Shotgun Microphone', specs: { Type: 'On-Camera Mic', Interface: 'MI Shoe', Directivity: 'Super/Uni/Omni-directional' } },
        { name: 'AV Home Receiver', specs: { Type: 'Home Theater Receiver', Channels: '7.2 Channel', Support: '8K Ultra HD' } }
      ],
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop'
      ],
      tags: ['audio', 'sony', 'headphones', 'tech']
    },
    {
      name: 'Apple',
      categoryId: 'e51631eb-1234-4567-89ab-cdef01234567', // Tech & Devices
      categorySlug: 'tech-devices',
      nouns: [
        { name: 'iPhone Leather Case', specs: { Type: 'Mobile Accessory', Material: 'Premium Leather', MagSafe_Support: 'Yes' } },
        { name: 'MagSafe Charger', specs: { Type: 'Wireless Charger', Max_Power_Delivery: '15W', Interface: 'USB-C' } },
        { name: 'AirTag Trackers', specs: { Type: 'Location Tracker', Connectivity: 'Bluetooth, U1 Chip', Water_Resistance: 'IP67' } },
        { name: 'Magic Keyboard', specs: { Type: 'Wireless Keyboard', Key_Layout: 'US English QWERTY', Connectivity: 'Bluetooth, Lightning' } },
        { name: 'Magic Mouse', specs: { Type: 'Wireless Mouse', Tracking: 'Laser tracking', Connectivity: 'Bluetooth, Rechargeable' } },
        { name: 'Smart Folio for iPad', specs: { Type: 'Tablet Accessory', Material: 'Polyurethane', Multi_angle_Stand: 'Yes' } },
        { name: 'Apple Pencil', specs: { Type: 'Stylus', Connectivity: 'Bluetooth, Magnetic Charging', Pressure_Sensitivity: 'Yes' } },
        { name: 'Thunderbolt Pro Cable', specs: { Type: 'Interface Cable', Transfer_Speed: 'Up to 40Gbps', Power_Delivery: 'Up to 100W' } },
        { name: 'AirPods Protective Case', specs: { Type: 'Audio Accessory', Material: 'Silicone', Qi_Wireless_Charging: 'Yes' } },
        { name: 'Dual USB-C Power Adapter', specs: { Type: 'Wall Charger', Ports: '2x USB-C', GaN_Technology: 'Yes' } }
      ],
      images: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1580870013141-3b13c5100dfb?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1622445262465-2481c4574875?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop'
      ],
      tags: ['apple', 'accessories', 'tech', 'minimalist']
    },
    {
      name: 'Nike',
      categoryId: 'f61732fc-2345-5678-9abc-def012345678', // Street Apparel
      categorySlug: 'street-apparel',
      nouns: [
        { name: 'Air Max Sneakers', specs: { Type: 'Footwear', Category: 'Running / Lifestyle', Cushioning: 'Max Air Unit' } },
        { name: 'Pegasus Running Shoes', specs: { Type: 'Footwear', Category: 'Road Running', Midsole: 'Zoom Air / React Foam' } },
        { name: 'Tech Fleece Hoodie', specs: { Type: 'Apparel', Material: '66% Cotton / 34% Polyester', Fit: 'Athletic Fit' } },
        { name: 'Windrunner Jacket', specs: { Type: 'Apparel', Material: '100% Recycled Polyester', Water_Resistance: 'DWR Coated' } },
        { name: 'Challenger Running Shorts', specs: { Type: 'Apparel', Fabric: 'Dri-FIT 100% Polyester', Waistband: 'Elastic with Drawcord' } },
        { name: 'Cushioned Crew Socks', specs: { Type: 'Accessory', Material: '67% Cotton / 30% Polyester', Technology: 'Dri-FIT' } },
        { name: 'Therma-FIT Joggers', specs: { Type: 'Apparel', Technology: 'Therma-FIT Heat Retention', Fit: 'Standard Fit' } },
        { name: 'Dri-FIT Training Tee', specs: { Type: 'Apparel', Fabric: 'Dri-FIT Odor-Resistant Polyester', Fit: 'Relaxed Fit' } },
        { name: 'Brasilia Duffel Bag', specs: { Type: 'Accessory', Material: '600D Polyester (Durable)', Compartments: 'Wet/Dry Shoe Pocket' } },
        { name: 'Heritage Hip Pack', specs: { Type: 'Accessory', Volume: '3 Liters', Pockets: 'Dual Zip Compartments' } }
      ],
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop'
      ],
      tags: ['nike', 'shoes', 'clothing', 'sports', 'streetwear']
    },
    {
      name: 'Razer',
      categoryId: 'b2222222-2222-2222-2222-222222222222', // Gaming Gear
      categorySlug: 'gaming',
      nouns: [
        { name: 'Mechanical Keyboard', specs: { Type: 'Gaming Keyboard', Switch_Type: 'Razer Green Clicky', RGB_Lighting: 'Razer Chroma RGB' } },
        { name: 'Wireless Gaming Mouse', specs: { Type: 'Gaming Mouse', Sensor: 'Focus Pro 30K Optical', Connection: 'HyperSpeed Wireless' } },
        { name: 'Esports Gaming Headset', specs: { Type: 'Gaming Headset', Drivers: 'TriForce Titanium 50mm', Connectivity: 'HyperSpeed Wireless, 3.5mm' } },
        { name: 'RGB Mouse Mat', specs: { Type: 'Gaming Accessory', Material: 'Micro-textured Cloth', RGB: 'Chroma Border Lighting' } },
        { name: 'Condenser Streaming Mic', specs: { Type: 'Microphone', Polar_Pattern: 'Supercardioid', Sample_Rate: '96kHz / 24-bit' } },
        { name: 'Webcam for Streamers', specs: { Type: 'Streaming Webcam', Resolution: '1080p @ 60FPS / 4K HDR', Sensor: 'Sony STARVIS' } },
        { name: 'Ergonomic Gaming Chair', specs: { Type: 'Furniture', Lumbar_Support: 'Fully Sculpted Adjustable', Material: 'Multi-layered Synthetic Leather' } },
        { name: 'Chroma RGB Key Light', specs: { Type: 'Streaming Light', Brightness: 'Up to 2800 Lumens', Color_Temp: '3000K - 7000K' } },
        { name: 'Thunderbolt Gaming Dock', specs: { Type: 'Gaming Dock', Ports: '10-in-1 Output', Power_Delivery: 'Up to 90W' } },
        { name: 'Mobile Game Controller', specs: { Type: 'Mobile Controller', Interface: 'USB-C direct connection', Compatibility: 'Android & iOS' } }
      ],
      images: [
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600086880633-c96d5b85a73b?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=600&auto=format&fit=crop'
      ],
      tags: ['gaming', 'razer', 'rgb', 'mouse', 'keyboard']
    },
    {
      name: 'Zara',
      categoryId: 'a1111111-1111-1111-1111-111111111111', // Fashion
      categorySlug: 'fashion',
      nouns: [
        { name: 'Textured Trench Coat', specs: { Type: 'Outwear', Material: '80% Wool / 20% Polyester', Fit: 'Relaxed Fit' } },
        { name: 'Comfort Fit Blazer', specs: { Type: 'Formal Wear', Material: 'Polyester Blend', Fit: 'Slim Fit' } },
        { name: 'Relaxed Denim Jacket', specs: { Type: 'Casual Wear', Material: '100% Rigid Denim Cotton', Fit: 'Oversized Fit' } },
        { name: 'Premium Linen Shirt', specs: { Type: 'Casual Wear', Material: '100% Organic Linen', Fit: 'Regular Fit' } },
        { name: 'Soft Leather Loafers', specs: { Type: 'Footwear', Upper_Material: '100% Cow Leather', Sole: 'Stacked Leather & Rubber' } },
        { name: 'Classic Chelsea Boots', specs: { Type: 'Footwear', Material: '100% Suede Leather', Sole: 'Crepe Rubber Sole' } },
        { name: 'Pleated Smart Trousers', specs: { Type: 'Formal Wear', Material: 'Wool Blend', Fit: 'Tapered Fit' } },
        { name: 'Heavyweight Cotton Tee', specs: { Type: 'Casual Wear', Weight: '280 GSM', Material: '100% Organic Cotton' } },
        { name: 'Knit Cable Cardigan', specs: { Type: 'Knitwear', Material: 'Wool & Alpaca Blend', Pattern: 'Classic Cable Knit' } },
        { name: 'Minimalist Shoulder Bag', specs: { Type: 'Accessory', Material: 'Full Grain Leather', Compartments: 'Inner Zippered Pocket' } }
      ],
      images: [
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop'
      ],
      tags: ['zara', 'fashion', 'clothing', 'modern', 'style']
    },
    {
      name: "L'Oreal",
      categoryId: 'd4444444-4444-4444-4444-444444444444', // Cosmetics
      categorySlug: 'cosmetics',
      nouns: [
        { name: 'Hyaluronic Face Serum', specs: { Type: 'Skincare', Skin_Type: 'All Skin Types', Key_Ingredients: '1.5% Hyaluronic Acid' } },
        { name: 'Cell Renewal Cream', specs: { Type: 'Skincare', Skin_Type: 'Mature, Dry Skin', Key_Ingredients: 'Natecium Active Complex' } },
        { name: 'Pure-Clay Cleanser', specs: { Type: 'Skincare', Clay_Type: '3 Pure Clays + Charcoal', Skin_Benefit: 'Detoxifies & Brightens' } },
        { name: 'Voluminous Mascara', specs: { Type: 'Makeup', Lash_Effect: 'Intense Volume & Length', Formula: 'Flake-Resistant Waterproof' } },
        { name: 'Satin Lipstick', specs: { Type: 'Makeup', Finish: 'Hydrating Satin', Key_Ingredients: 'Argan Oil & Vitamin E' } },
        { name: 'Anti-Wrinkle Eye Cream', specs: { Type: 'Skincare', Target_Area: 'Under-eye, Crow\'s feet', Active_Ingredients: 'Pro-Retinol & Centella' } },
        { name: 'Sulfate-Free Conditioner', specs: { Type: 'Haircare', Hair_Type: 'Color-treated, Dry Hair', Formula: '100% Sulfate-Free Vegan' } },
        { name: 'Extraordinary Hair Oil', specs: { Type: 'Haircare', Hair_Benefit: 'Nourishes & Adds Shine', Ingredients: '6 Flower Micro-Oils' } },
        { name: 'Self-Tanning Mist', specs: { Type: 'Skincare', Tan_Type: 'Streak-Free Airbrush', Skin_Benefit: 'Vitamin E Hydration' } },
        { name: 'Micellar Cleansing Water', specs: { Type: 'Skincare', Skin_Type: 'Sensitive Skin', Benefit: 'Removes Makeup & Cleanses' } }
      ],
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop'
      ],
      tags: ['cosmetics', 'beauty', 'loreal', 'skincare', 'makeup']
    }
  ]

  for (const b of specialBrands) {
    for (let variantIndex = 1; variantIndex <= 2; variantIndex++) {
      let index = 1
      for (const nounObj of b.nouns) {
        const globalIndex = (variantIndex - 1) * b.nouns.length + index
        
        const isVar1 = variantIndex === 1
        const version = isVar1 ? 'Pro' : 'Ultra'
        const color = isVar1 ? 'Stealth Black' : 'Arctic White'
        const size = isVar1 ? 'M' : 'L'
        
        const productId = generateUUID(`brand-${b.name.toLowerCase()}`, globalIndex)
        const name = `${b.name} ${nounObj.name} (${version} Edition)`
        const productSlug = `${b.categorySlug}-${b.name.toLowerCase()}-${nounObj.name.toLowerCase().replace(/\s+/g, '-')}-${version.toLowerCase()}-${globalIndex}`
        
        const basePrice = 29 + ((globalIndex * 19) % 250)
        const price = Number(basePrice.toFixed(2))
        const compare_price = globalIndex % 3 === 0 ? Number((price * 1.25).toFixed(2)) : null
        const cost_price = Number((price * 0.45).toFixed(2))
        
        const sku = `${b.name.slice(0, 3).toUpperCase()}-${String(globalIndex).padStart(3, '0')}-${b.categorySlug.slice(0, 3).toUpperCase()}`
        const stock_quantity = 10 + ((globalIndex * 13) % 90)
        
        const images = [b.images[(globalIndex - 1) % b.images.length]]
        const tags = [...new Set([...b.tags, b.name.toLowerCase(), color.toLowerCase(), version.toLowerCase()])]
        if (b.name.includes("'")) {
          tags.push(b.name.replace("'", "").toLowerCase())
        }
        
        const is_featured = globalIndex <= 3
        
        // Construct brand specs
        const itemSpecs: { brand: string; color: string; size: string; [key: string]: any } = {
          brand: b.name,
          color: color,
          size: size,
          ...nounObj.specs
        }
        
        const product_variants: ProductVariant[] = [
          {
            id: generateUUID(`var-${productId}`, 1),
            product_id: productId,
            name: `${color} / ${size}`,
            price: price,
            stock_quantity: Math.floor(stock_quantity / 2),
            sku: `${sku}-01`,
            options: { color, size }
          },
          {
            id: generateUUID(`var-${productId}`, 2),
            product_id: productId,
            name: `${color} Special Edition`,
            price: Number((price * 1.1).toFixed(2)),
            stock_quantity: Math.floor(stock_quantity / 2),
            sku: `${sku}-02`,
            options: { color, size, edition: 'Special' }
          }
        ]
        
        productsList.push({
          id: productId,
          name,
          slug: productSlug,
          description: `Premium official ${nounObj.name} by ${b.name} (${version} Edition). Formulated and designed for high durability, performance, and modern aesthetics. Meets all strict official guidelines.`,
          price,
          compare_price,
          cost_price,
          sku,
          stock_quantity,
          category_id: b.categoryId,
          images,
          tags,
          is_active: true,
          is_featured,
          weight: Number((0.2 + ((globalIndex * 0.05) % 1.5)).toFixed(2)),
          metadata: itemSpecs,
          created_at: new Date(Date.now() - (globalIndex + 100) * 3600 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          product_variants
        })
        
        index++
      }
    }
  }

  return productsList
}
