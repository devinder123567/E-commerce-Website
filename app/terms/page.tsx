'use client'

import { Link } from 'wouter'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Scale, 
  UserCheck, 
  ShoppingBag, 
  Truck, 
  Copyright, 
  AlertTriangle, 
  Gavel, 
  RefreshCw 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TermsPage() {
  const lastUpdated = "June 6, 2026"

  const sections = [
    {
      title: "1. Agreement to Terms",
      description: "By accessing EliteCart, you agree to comply with and be bound by these Terms of Service:",
      icon: Scale,
      points: [
        {
          label: "Legal Capacity",
          detail: "You represent that you are at least the age of majority in your state or province of residence."
        },
        {
          label: "Acceptance",
          detail: "Accessing or using any part of the site implies full agreement to all rules and conditions described herein."
        },
        {
          label: "Updates",
          detail: "We reserve the right to update, change, or replace any part of these Terms by posting updates to our website."
        }
      ]
    },
    {
      title: "2. User Accounts & Security",
      description: "When creating an account with us, you accept responsibility for maintaining your credentials:",
      icon: UserCheck,
      points: [
        {
          label: "Account Accuracy",
          detail: "You agree to provide current, complete, and accurate purchase and account details for all transactions."
        },
        {
          label: "Password Confidentiality",
          detail: "You are responsible for safeguarding your password and restricting access to your account."
        },
        {
          label: "Account Termination",
          detail: "We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion."
        }
      ]
    },
    {
      title: "3. Purchases, Payments & Pricing",
      description: "Details regarding commercial transactions, catalog pricing, and payments:",
      icon: ShoppingBag,
      points: [
        {
          label: "Price Changes",
          detail: "Prices for our products are subject to change without notice. We reserve the right to modify or discontinue services."
        },
        {
          label: "Stripe Processing",
          detail: "Payments are captured securely using Stripe. All transactions are subject to authorization and verification checks."
        },
        {
          label: "Order Verification",
          detail: "We reserve the right to limit or reject orders that, in our judgment, appear to be placed by dealers, resellers, or distributors."
        }
      ]
    },
    {
      title: "4. Shipping & Returns",
      description: "Our policy guidelines regarding order fulfillment, delivery, and exchange procedures:",
      icon: Truck,
      points: [
        {
          label: "Delivery Estimates",
          detail: "Shipping estimates are provided at checkout. EliteCart is not responsible for transit delays caused by carriers."
        },
        {
          label: "Return Window",
          detail: "We offer a 30-day exchange and return window for items in their original, unused packaging."
        },
        {
          label: "Return Shipping",
          detail: "Unless the item is defective or incorrect, return shipping costs are the responsibility of the customer."
        }
      ]
    },
    {
      title: "5. Intellectual Property",
      description: "Ownership and rights regarding the visual and code assets of EliteCart:",
      icon: Copyright,
      points: [
        {
          label: "Proprietary Material",
          detail: "All content included on this site, such as text, custom graphics, logos, and software, is the property of EliteCart."
        },
        {
          label: "Usage Restrictions",
          detail: "You may not copy, reproduce, distribute, or create derivative works of any assets without express written permission."
        }
      ]
    },
    {
      title: "6. Limitation of Liability",
      description: "Disclaimer and limitation of legal liability regarding website usage:",
      icon: AlertTriangle,
      points: [
        {
          label: "As-Is Service",
          detail: "Our website and all products delivered to you are provided on an 'as is' and 'as available' basis for your use."
        },
        {
          label: "Liability Caps",
          detail: "In no case shall EliteCart, our directors, or employees be liable for any indirect, incidental, or consequential damages."
        }
      ]
    }
  ]

  return (
    <div className="flex flex-col min-h-screen pb-16 bg-background">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background py-16 border-b border-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl text-center space-y-4">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex items-center gap-2 rounded-full border border-muted/30 hover:bg-muted/35 text-xs")}
          >
            <ArrowLeft size={12} /> Back to Shop
          </Link>
          <div className="pt-2">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-3 py-1 font-semibold uppercase tracking-wider text-[10px]">
              Terms & Conditions
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            Please read these terms carefully before accessing or using our website.
          </p>
          <div className="inline-block bg-muted/20 border border-muted/50 px-4 py-1.5 rounded-full text-[11px] font-mono text-muted-foreground">
            Last Updated: {lastUpdated}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl mt-12 space-y-12">
        {/* Section Cards */}
        <div className="space-y-8">
          {sections.map((sec, idx) => {
            const Icon = sec.icon
            return (
              <Card key={idx} className="border-muted/50 bg-muted/5 shadow-sm overflow-hidden hover:border-muted-foreground/35 transition-colors">
                <CardHeader className="border-b border-muted/30 bg-muted/10 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Icon size={18} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-extrabold tracking-tight">{sec.title}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">{sec.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-5">
                  <ul className="space-y-4">
                    {sec.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex gap-3 items-start text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <strong className="text-foreground font-semibold">{pt.label}:</strong>
                          <span className="text-muted-foreground block leading-relaxed">{pt.detail}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
