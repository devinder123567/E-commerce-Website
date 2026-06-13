import { Route, Switch } from 'wouter'
import { Providers } from '@/components/shared/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { Chatbot } from '@/components/shared/Chatbot'
import { useEffect } from 'react'
import AOS from 'aos'

import HomePage from '@/app/page'
import LoginPage from '@/app/login/page'
import RegisterPage from '@/app/register/page'
import CartPage from '@/app/cart/page'
import CheckoutPage from '@/app/checkout/page'
import CheckoutSuccessPage from '@/app/checkout/success/page'
import ProductsPage from '@/app/products/page'
import ProductDetailPage from '@/app/products/[slug]/page'
import CategoryPage from '@/app/category/[slug]/page'
import AccountPage from '@/app/account/page'
import AccountOrdersPage from '@/app/account/orders/page'
import AccountWishlistPage from '@/app/account/wishlist/page'
import AdminPage from '@/app/admin/page'
import AdminOrdersPage from '@/app/admin/orders/page'
import AdminProductsPage from '@/app/admin/products/page'
import AdminNewProductPage from '@/app/admin/products/new/page'
import AdminEditProductPage from '@/app/admin/products/[id]/page'
import AdminAdvertisementsPage from '@/app/admin/advertisements/page'
import PrivacyPage from '@/app/privacy/page'
import TermsPage from '@/app/terms/page'
import FAQPage from '@/app/faq/page'
import AboutPage from '@/app/about/page'

export default function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-quad',
    })
  }, [])

  return (
    <Providers>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/cart" component={CartPage} />
            <Route path="/checkout" component={CheckoutPage} />
            <Route path="/checkout/success" component={CheckoutSuccessPage} />
            <Route path="/products" component={ProductsPage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/terms" component={TermsPage} />
            <Route path="/faq" component={FAQPage} />
            <Route path="/about" component={AboutPage} />
            
            <Route path="/products/:slug">
              {(params) => <ProductDetailPage params={{ slug: params.slug }} />}
            </Route>
            
            <Route path="/category/:slug">
              {(params) => <CategoryPage params={{ slug: params.slug }} />}
            </Route>

            <Route path="/account" component={AccountPage} />
            <Route path="/account/orders" component={AccountOrdersPage} />
            <Route path="/account/wishlist" component={AccountWishlistPage} />
            
            <Route path="/admin/advertisements" component={AdminAdvertisementsPage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/admin/orders" component={AdminOrdersPage} />
            <Route path="/admin/products" component={AdminProductsPage} />
            <Route path="/admin/products/new" component={AdminNewProductPage} />
            
            <Route path="/admin/products/:id">
              {(params) => <AdminEditProductPage params={{ id: params.id }} />}
            </Route>

            <Route>
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <h1 className="text-4xl font-extrabold">404 - Page Not Found</h1>
                <p className="text-muted-foreground">The page you are looking for does not exist.</p>
              </div>
            </Route>
          </Switch>
        </main>
        <CartDrawer />
        <Chatbot />
        <Footer />
      </div>
    </Providers>
  )
}
