-- Migration: Create Advertisements table for homepage promo banners
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    link_url TEXT NOT NULL DEFAULT '/products',
    button_text TEXT NOT NULL DEFAULT 'Buy Now',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Apply updated_at trigger
CREATE TRIGGER update_advertisements_updated_at 
BEFORE UPDATE ON public.advertisements 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Select policy: Public can read active ads, admin can read all
CREATE POLICY "Public advertisements read" 
ON public.advertisements 
FOR SELECT 
USING (is_active = true OR public.is_admin());

-- Manage policy: Admins can do all CRUD
CREATE POLICY "Admins can manage advertisements" 
ON public.advertisements 
TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());
