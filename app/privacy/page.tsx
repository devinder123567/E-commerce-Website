'use client'

import { Link } from 'wouter'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Database, 
  Users, 
  Cookie, 
  Mail, 
  FileText 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PrivacyPage() {
  const lastUpdated = "June 6, 2026"

  const sections = [
    {
      title: "1. Information We Collect",
      description: "We collect information to provide a smooth, premium shopping experience. This details the exact data points we collect:",
      icon: Eye,
      points: [
        {
          label: "Account Credentials",
          detail: "Your email address, secure password hash, username, and user profile preferences when you register."
        },
        {
          label: "Transaction Details",
          detail: "Information about your purchases, shipping addresses, products viewed, cart states, and wishlists."
        },
        {
          label: "Payment Data",
          detail: "All transactions are processed through Stripe. We do not store raw credit card numbers or security codes on our servers."
        },
        {
          label: "Usage and Analytics",
          detail: "Your IP address, browser type, device information, and activity logs on EliteCart to help optimize performance."
        }
      ]
    },
    {
      title: "2. How We Use Your Information",
      description: "We use the collected information for the following specific operational purposes:",
      icon: ShieldCheck,
      points: [
        {
          label: "Order Fulfillment",
          detail: "Processing payments, delivering order confirmations, handling logistics, and updating delivery status."
        },
        {
          label: "Personalization",
          detail: "Recommending relevant items, remembering your shopping cart layout, and maintaining wishlist items."
        },
        {
          label: "Communications",
          detail: "Sending critical transaction messages, customer support responses, and optional promotional newsletter drops."
        },
        {
          label: "Platform Security",
          detail: "Preventing fraudulent transactions, detecting unauthorized account access, and verifying checkout sessions."
        }
      ]
    },
    {
      title: "3. Data Storage & Security",
      description: "Securing your data is our primary commitment. We implement the following protective measures:",
      icon: Lock,
      points: [
        {
          label: "Secure Servers",
          detail: "Your account details and transaction records are stored securely on database instances managed by Supabase."
        },
        {
          label: "Data Encryption",
          detail: "All database connections use modern SSL/TLS transport layer security. Sensitive database columns are encrypted at rest."
        },
        {
          label: "Stripe Vaulting",
          detail: "Credit card information is vaulted and processed via Stripe's highly secure, PCI-DSS compliant infrastructure."
        },
        {
          label: "Session Integrity",
          detail: "Authentications are secured using short-lived access tokens and HttpOnly, Secure cookie attributes."
        }
      ]
    },
    {
      title: "4. Third-Party Integrations",
      description: "We partner with trusted service providers to make our e-commerce platform run flawlessly:",
      icon: Database,
      points: [
        {
          label: "Supabase",
          detail: "Acts as our backend database system, authentication provider, and stores user profiles securely."
        },
        {
          label: "Stripe Payments",
          detail: "Acts as our primary merchant processor. Handles all checkout validation, payment holds, and refunds."
        },
        {
          label: "CDN Delivery Services",
          detail: "We serve static images and assets using optimized, global Content Delivery Networks like Unsplash."
        }
      ]
    },
    {
      title: "5. Your Rights & Control",
      description: "You have full control over your personal data. You can exercise the following options:",
      icon: Users,
      points: [
        {
          label: "Data Portability",
          detail: "Request a downloadable export of all personal data EliteCart holds regarding your profile and orders."
        },
        {
          label: "Account Modifications",
          detail: "Edit your username, profile settings, and shipping address records directly within the Account dashboard."
        },
        {
          label: "Account Deletion",
          detail: "Request permanent removal of your account, transaction logs, and personal identifiers from our databases."
        },
        {
          label: "Marketing Opt-Out",
          detail: "Unsubscribe from promotional emails instantly via the link in the footer of any EliteCart marketing email."
        }
      ]
    },
    {
      title: "6. Cookies Policy",
      description: "We use cookies to maintain your shopping state and understand site usage:",
      icon: Cookie,
      points: [
        {
          label: "Essential Cookies",
          detail: "Required to keep you logged in and ensure items in your cart remain active during your session."
        },
        {
          label: "Analytics Cookies",
          detail: "Help us understand traffic patterns and which products are most popular, allowing us to build a better shop."
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
              Compliance & Transparency
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
            Privacy & Policy
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            Your trust is our most valuable asset. Read below for a pointwise breakdown of how we manage, protect, and value your personal data.
          </p>
          <div className="inline-block bg-muted/20 border border-muted/50 px-4 py-1.5 rounded-full text-[11px] font-mono text-muted-foreground">
            Last Updated: {lastUpdated}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl mt-12 space-y-12">
        {/* Quick Summary Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/10 to-primary/5 border border-primary/20 flex flex-col md:flex-row gap-6 items-start">
          <div className="p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
            <FileText size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-foreground">EliteCart Trust Promise</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We do not sell, rent, or trade your personal information to third parties. We collect only the data necessary to process your transactions, manage your user session, and deliver support.
            </p>
          </div>
        </div>

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

        {/* Contact/Support Section */}
        <div className="p-8 rounded-3xl bg-muted/20 border border-muted/50 text-center space-y-4 max-w-xl mx-auto">
          <div className="mx-auto p-3 bg-primary/10 rounded-2xl w-fit text-primary">
            <Mail size={24} />
          </div>
          <h3 className="font-extrabold text-sm">Have Privacy Questions?</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Our data protection office is ready to help with account deletions, data exports, or general inquiries.
          </p>
          <div className="pt-2">
            <a 
              href="mailto:privacy@elitecart.com" 
              className={cn(buttonVariants({ size: "sm" }), "rounded-full font-bold px-6 text-xs")}
            >
              Contact Privacy Team
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
