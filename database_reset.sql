-- CASE OF BEAUTY - PERFECT MATCH DATABASE RECONSTRUCTION
-- Rebuilds everything to match your HTML/JS code 100%
-- Run this in your Supabase SQL Editor.

-- ==========================================
-- 0. CLEAN SLATE
-- ==========================================
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES (Matched to frontend variable names)
-- ==========================================

-- Users
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Categories (Uses 'title' to match script.js)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Products (Includes 'tag', 'is_new_launch' to match script.js filters)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL DEFAULT 0,
    tag TEXT DEFAULT 'NEW',
    is_new_launch BOOLEAN DEFAULT false,
    image TEXT,
    discount_price DECIMAL,
    stock INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    rating DECIMAL DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Banners
CREATE TABLE public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    image TEXT NOT NULL,
    link TEXT DEFAULT '#',
    subtitle TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Sales (Matches 'Flash Sale' logic)
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    discount TEXT NOT NULL,
    enddate TIMESTAMP WITH TIME ZONE NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Videos (Reels)
CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL DEFAULT 0,
    video_url TEXT NOT NULL,
    product_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Reviews
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    userName TEXT NOT NULL,
    stars INTEGER DEFAULT 5,
    text TEXT,
    product TEXT, -- Denormalized name for script.js
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    price DECIMAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    shipping_name TEXT,
    shipping_phone TEXT,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Addresses
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Site Settings (General configuration)
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.settings (key, value) VALUES ('top_bar_message', 'Buy Any 3 At ₹999') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==========================================
-- 2. SECURITY (PERMISSIVE)
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Delete old policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Permissive" ON public.users;
DROP POLICY IF EXISTS "Permissive" ON public.categories;
DROP POLICY IF EXISTS "Permissive" ON public.products;
DROP POLICY IF EXISTS "Permissive" ON public.orders;
DROP POLICY IF EXISTS "Permissive" ON public.addresses;
DROP POLICY IF EXISTS "Permissive" ON public.reviews;
DROP POLICY IF EXISTS "Permissive" ON public.banners;
DROP POLICY IF EXISTS "Permissive" ON public.sales;
DROP POLICY IF EXISTS "Permissive" ON public.videos;
DROP POLICY IF EXISTS "Permissive" ON public.settings;

CREATE POLICY "Permissive" ON public.users FOR ALL USING (true);
CREATE POLICY "Permissive" ON public.categories FOR ALL USING (true);
CREATE POLICY "Permissive" ON public.products FOR ALL USING (true);
CREATE POLICY "Permissive" ON public.orders FOR ALL USING (true);
CREATE POLICY "Permissive" ON public.addresses FOR ALL USING (true);
CREATE POLICY "Permissive" ON public.reviews FOR ALL USING (true);
CREATE POLICY "Permissive" ON public.banners FOR ALL USING (true);
CREATE POLICY "Permissive" ON public.sales FOR ALL USING (true);
CREATE POLICY "Permissive" ON public.videos FOR ALL USING (true);
CREATE POLICY "Permissive" ON public.settings FOR ALL USING (true);

-- ==========================================
-- 3. STORAGE & POLICIES
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop storage policies if they exist to prevent errors
DROP POLICY IF EXISTS "Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- Also drop user's existing policy names if they are different
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;

CREATE POLICY "Public Select" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'images');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'images');
