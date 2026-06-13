'use client'

import { Link } from 'wouter'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Sparkles, 
  ShoppingBag, 
  Truck, 
  Smile, 
  Heart, 
  ShieldCheck, 
  ArrowRight,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AboutPage() {
  const departments = [
    {
      title: "Fashion Accessories & Apparel",
      description: "Stay ahead of trends with our clothing and accessories:",
      points: [
        "Curated Streetwear: Heavyweight hoodies, t-shirts, and everyday premium apparel.",
        "Aesthetic Accessories: Backpacks, designer watches, eyewear, and premium wallets.",
        "Quality Linings: Sourced from sustainable cotton and durable synthetic fibers."
      ]
    },
    {
      title: "Premium Cosmetics & Skincare",
      description: "Elevate your beauty and grooming routine with authentic products:",
      points: [
        "Beauty Essentials: Complete lip care, face palettes, makeup brushes, and tools.",
        "Dermatologist Sourced: Gentle skincare packs, organic moisturizers, and sunscreens.",
        "100% Cruelty-Free: We guarantee that none of our beauty items are tested on animals."
      ]
    },
    {
      title: "Smart Devices & Tech Gadgets",
      description: "Power your productivity and lifestyle with modern electronics:",
      points: [
        "Audio Gear: Studio-grade noise-cancelling headphones, earbuds, and speakers.",
        "Desktop Tools: Premium mechanical keyboards, fast-charging hubs, and desk mats.",
        "Wearable Tech: Feature-rich smartwatches and health monitoring accessories."
      ]
    },
    {
      title: "Home & Lifestyle Essentials",
      description: "Upgrade your living spaces with functional and modern decor:",
      points: [
        "Minimalist Decor: Sleek table lighting, organizational containers, and aroma diffusers.",
        "Travel Accessories: Thermal water bottles, travel organizers, and multi-tools.",
        "Workstation Setup: Ergonomic accessories designed to support focus and posture."
      ]
    }
  ]

  const servicePillars = [
    {
      title: "Super-Fast Regional Delivery",
      icon: Truck,
      description: "Utilizing a nationwide network of fulfilment hubs to ensure your packages arrive on time. Express options get products to your door in 24-48 hours."
    },
    {
      title: "Unbeatable Mega Deals",
      icon: Zap,
      description: "Just like Amazon and Flipkart, we partner directly with brands to eliminate middleman margins, offering unbeatable prices, coupon codes, and bundle savings."
    },
    {
      title: "100% Genuine Protection",
      icon: ShieldCheck,
      description: "No fakes, no replicas. Every product in our cosmetics, apparel, and tech sections is sourced directly from certified brand developers and distributors."
    },
    {
      title: "Hassle-Free Returns & Support",
      icon: Smile,
      description: "Changed your mind? We provide an easy 30-day return window. Contact our live support specialists at any time for quick solutions."
    }
  ]

  const timelineSteps = [
    {
      year: "2024",
      title: "The Vision of an All-in-One Megastore",
      description: "EliteCart started with a simple goal: to build an online hypermarket combining the vast choices of Flipkart and Amazon with the high-quality curation of a boutique design store."
    },
    {
      year: "2025",
      title: "Category Expansion",
      description: "Following our successful apparel launch, we introduced Cosmetics, Beauty care, and smart Tech Gadgets, growing to support over 500 brands and serving millions of orders nationwide."
    },
    {
      year: "2026",
      title: "Smarter Logistics & Sustainable Care",
      description: "We optimized our delivery centers to provide same-day regional shipping and integrated circular economy guidelines, helping recycle packaging waste."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-background">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background py-20 border-b border-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl text-center space-y-4">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex items-center gap-2 rounded-full border border-muted/30 hover:bg-muted/35 text-xs")}
          >
            <ArrowLeft size={12} /> Back to Shop
          </Link>
          <div className="pt-2">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-3 py-1 font-semibold uppercase tracking-wider text-[10px]">
              About EliteCart
            </Badge>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mt-2 leading-tight">
            Your Ultimate <br />
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              Online Megastore
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Welcome to EliteCart—your one-stop digital shopping hub. Much like Amazon and Flipkart, we offer a massive catalog spanning fashion accessories, premium cosmetics, smart tech, and home essentials.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl mt-12 space-y-20">
        
        {/* Workspace Display Image and Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
              <Sparkles size={12} /> The EliteCart Guarantee
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Every Category, Sourced for Premium Quality
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              At EliteCart, we understand that modern shoppers deserve both variety and security. We combine the vast selection of large-scale e-commerce sites with a dedication to authentic products and speedy logistics.
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              From the lipstick or moisturizer you apply in the morning, to the tech accessories you use at work, and the streetwear outfits you wear on the weekend—we have you covered under a single checkout.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-muted/60 bg-muted/20 shadow-2xl">
            <img
              src="/app/about_workspace.png"
              alt="EliteCart Megastore Vision"
              className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-102 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Categories / Point-wise catalog detail */}
        <div className="space-y-8">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Shop by Department</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Explore a pointwise breakdown of the major departments available on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dep, idx) => (
              <Card key={idx} className="border-muted/50 bg-muted/5 shadow-sm overflow-hidden hover:border-primary/20 transition-colors">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                      <ShoppingBag size={20} />
                    </div>
                    <h3 className="font-extrabold text-sm text-foreground">{dep.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground italic">{dep.description}</p>
                  <ul className="space-y-3">
                    {dep.points.map((pt, pIdx) => {
                      const [boldLabel, descText] = pt.split(': ')
                      return (
                        <li key={pIdx} className="flex gap-2 items-start text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <div className="space-y-0.5">
                            <strong className="text-foreground font-semibold">{boldLabel}:</strong>
                            <span className="text-muted-foreground block leading-relaxed">{descText}</span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pillars / Service Quality */}
        <div className="space-y-8 border-t border-muted/50 pt-16">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Our Core Services</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We leverage premium technology to make shopping as effortless as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {servicePillars.map((p, idx) => {
              const Icon = p.icon
              return (
                <div key={idx} className="flex items-start gap-4 p-5 bg-muted/10 border border-muted/30 rounded-2xl">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{p.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* History / Timeline */}
        <div className="space-y-8 border-t border-muted/50 pt-16">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Our Journey</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              How we built EliteCart into an online destination.
            </p>
          </div>

          <div className="relative border-l border-muted/80 ml-4 md:ml-32 py-4 space-y-12">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                
                {/* Year Label on left for wide screens */}
                <div className="hidden md:block absolute -left-32 top-0.5 w-24 text-right text-sm font-black text-primary">
                  {step.year}
                </div>

                <div className="space-y-1">
                  <span className="inline-block md:hidden text-xs font-black text-primary uppercase tracking-widest">{step.year}</span>
                  <h4 className="font-extrabold text-sm text-foreground">{step.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA section */}
        <div className="p-10 rounded-3xl bg-gradient-to-r from-violet-900/60 to-primary/60 border border-muted/50 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">Start Exploring Today</h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Enjoy free shipping on orders over $150 and secure Stripe checkout across all departments.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }), 'rounded-full font-bold px-8 shadow-2xl gap-2 text-xs')}
            >
              Shop the Catalog <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </section>
    </div>
  )
}
