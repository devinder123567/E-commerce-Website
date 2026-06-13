import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/shared/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'EliteCart - Premium E-Commerce Experience',
  description: 'A complete production-ready e-commerce experience offering premium tech and apparel.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn('dark', inter.variable)}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <CartDrawer />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
