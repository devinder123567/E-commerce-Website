-- Create Enums
CREATE TYPE profile_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    role profile_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    price NUMERIC(12, 2) NOT NULL,
    compare_price NUMERIC(12, 2),
    cost_price NUMERIC(12, 2),
    sku TEXT NOT NULL UNIQUE,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}'::text[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    weight NUMERIC(8, 2) DEFAULT 0.0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Product Variants Table
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"size": "XL", "color": "Red"}
    price NUMERIC(12, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    sku TEXT NOT NULL
);

-- 5. Addresses Table
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false
);

-- 6. Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status order_status NOT NULL DEFAULT 'pending',
    subtotal NUMERIC(12, 2) NOT NULL,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    shipping NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    total NUMERIC(12, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_intent_id TEXT,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Order Items Table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    product_snapshot JSONB NOT NULL
);

-- 8. Cart Items Table
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Wishlists Table
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 10. Reviews Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Coupons Table
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    type coupon_type NOT NULL DEFAULT 'percentage',
    value NUMERIC(12, 2) NOT NULL,
    min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    max_uses INTEGER NOT NULL DEFAULT 100,
    used_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 12. Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- TRIGGERS & TRIGGERS FUNCTIONS

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'customer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- 1. Profiles Policies
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. Categories Policies
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Products Policies
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage products" ON public.products TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Product Variants Policies
CREATE POLICY "Public product variants read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage product variants" ON public.product_variants TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Addresses Policies
CREATE POLICY "Users can manage their own addresses" ON public.addresses TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage addresses" ON public.addresses TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Orders Policies
CREATE POLICY "Users can read their own orders" ON public.orders TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Order Items Policies
CREATE POLICY "Users can read their own order items" ON public.order_items TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
);
CREATE POLICY "Users can create order items for their own orders" ON public.order_items TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage order items" ON public.order_items TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Cart Items Policies
CREATE POLICY "Users can manage their own cart items" ON public.cart_items TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Wishlists Policies
CREATE POLICY "Users can manage their own wishlist items" ON public.wishlists TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. Reviews Policies
CREATE POLICY "Public reviews read" ON public.reviews FOR SELECT USING (true);
-- Verified purchase constraint enforced dynamically or via this insert policy:
CREATE POLICY "Authenticated users can create reviews for verified purchases" ON public.reviews TO authenticated WITH CHECK (
    auth.uid() = user_id AND (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.order_items oi ON o.id = oi.order_id
            WHERE o.user_id = auth.uid()
              AND oi.product_id = reviews.product_id
              AND o.payment_status = 'paid'
        )
    )
);
CREATE POLICY "Users can update/delete their own reviews" ON public.reviews TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can delete any reviews" ON public.reviews TO authenticated USING (public.is_admin());

-- 11. Coupons Policies
CREATE POLICY "Public coupons read" ON public.coupons FOR SELECT USING (is_active = true AND expires_at > NOW());
CREATE POLICY "Admins can manage coupons" ON public.coupons TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 12. Notifications Policies
CREATE POLICY "Users can manage their own notifications" ON public.notifications TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON public.notifications TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
