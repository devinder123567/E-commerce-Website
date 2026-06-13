'use client'

import { Link } from 'wouter'

export function Footer() {
  return (
    <footer className="border-t border-muted bg-muted/20 text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">EliteCart Megastore</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your ultimate online destination for fashion accessories, premium cosmetics, smart gadgets, and lifestyle essentials. Delivering variety, value, and speed just like the largest e-commerce hubs.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">Categories</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?categoryId=e51631eb-1234-4567-89ab-cdef01234567" className="hover:text-primary transition-colors">
                  Tech Gadgets
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=f61732fc-2345-5678-9abc-def012345678" className="hover:text-primary transition-colors">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-wider uppercase mb-4">Newsletter</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Subscribe to get news on new collection drops.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full bg-background border border-muted px-3 py-1.5 rounded-full text-xs focus:outline-none focus:border-primary transition-all"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-muted mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>&copy; {new Date().getFullYear()} EliteCart Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-foreground">About Us</Link>
            <Link href="/faq" className="hover:text-foreground">FAQs</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
