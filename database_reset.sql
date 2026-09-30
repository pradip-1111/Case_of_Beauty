-- CASE OF BEAUTY / PRAKRITI BOTANICALS - PRODUCTION DATABASE SCHEMA & 20 PRODUCT SEED DATA
-- Run this script in your Supabase SQL Editor to rebuild the entire database cleanly with 20 pre-populated products!

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
-- 1. TABLES & STRUCTURE
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

-- Categories
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT UNIQUE NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Products
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL DEFAULT 0,
    discount_price DECIMAL,
    tag TEXT DEFAULT 'NEW',
    is_new_launch BOOLEAN DEFAULT false,
    image TEXT,
    stock INTEGER DEFAULT 50,
    is_featured BOOLEAN DEFAULT false,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    rating DECIMAL DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 120,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Banners
CREATE TABLE public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    image TEXT NOT NULL,
    link TEXT DEFAULT '#shop',
    subtitle TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Sales
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
    product TEXT,
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

-- Site Settings
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 2. SEED DATA (20 BOTANICAL PRODUCTS + CATEGORIES)
-- ==========================================

-- Categories
INSERT INTO public.categories (title, image) VALUES
('Skincare', 'https://images.unsplash.com/photo-1608248597261-e4d044696386?w=600&auto=format&fit=crop&q=80'),
('Haircare', 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80'),
('Body Care', 'https://images.unsplash.com/photo-1556228722-d1191e3266ec?w=600&auto=format&fit=crop&q=80'),
('Lip & Eye Care', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80')
ON CONFLICT (title) DO NOTHING;

-- Products (20 Luxury Items)
INSERT INTO public.products (name, description, price, discount_price, tag, is_new_launch, stock, is_featured, rating, reviews_count, image) VALUES
('Golden Botanical Elixir Face Oil', 'Pure cold-pressed botanical oils infused with 24K gold flakes for intense nourishment and youthful glow.', 1499, 1299, 'BESTSELLER', false, 45, true, 4.9, 124, 'https://images.unsplash.com/photo-1608248597261-e4d044696386?w=600&auto=format&fit=crop&q=80'),
('Organic Neem & Tea Tree Cleansing Gel', 'Gentle clarifying facial cleanser infused with fresh neem extract and tea tree oil to purify pores.', 699, 599, 'ORGANIC', false, 60, true, 4.8, 88, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'),
('Prakriti Rose & Aloe Revitalizing Mist', 'Pure Steam-distilled Kannauj Rose water enriched with organic aloe vera for instant hydration and calming skin boost.', 799, 649, 'HYDRATING', true, 80, true, 4.9, 210, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80'),
('Kumkumadi Radiant Glow Night Serum', 'Ancient Ayurvedic formula with Kashmiri Saffron and 16 precious herbs for overnight skin brightness and spot correction.', 2199, 1899, 'LUXURY', false, 30, true, 5.0, 340, 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80'),
('Saffron & Sandalwood Youth Repair Cream', 'Deeply moisturizing night repair cream that firms skin texture and minimizes fine lines.', 1899, 1599, 'ANTI-AGING', false, 50, false, 4.9, 175, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80'),
('Green Tea & Hyaluronic Clarifying Concentrate', 'Lightweight oil-free hydrating serum that balances sebum production and restores moisture balance.', 1299, 1099, 'NEW', true, 40, false, 4.7, 95, 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80'),
('Radiant Botanical Sunscreen Gel SPF 50', 'Non-greasy broad spectrum sun defense enriched with Centella and Green Tea extracts. Zero white cast.', 999, 849, 'SUN DEFENSE', true, 80, true, 4.9, 270, 'https://images.unsplash.com/photo-1567928257065-c14669877d84?w=600&auto=format&fit=crop&q=80'),
('Botanical Detox Clarifying Clay Mask', 'French Green Clay and Activated Charcoal mask that draws out toxins and refines pores in 10 minutes.', 1149, 949, 'PURIFYING', false, 45, false, 4.8, 145, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&auto=format&fit=crop&q=80'),

('Brahmi & Bhringraj Nourishing Hair Oil', 'Traditional slow-cooked herbal hair elixir that stimulates scalp circulation and stops hair fall.', 899, 749, 'HERBAL', false, 70, true, 4.9, 280, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80'),
('Hibiscus & Coconut Intense Moisture Shampoo', 'Sulfate-free creamy botanical cleanser that restores silkiness and bounce to dry damaged hair.', 799, 699, 'SULFATE-FREE', false, 65, true, 4.8, 190, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80'),
('Argan & Onion Scalp Revitalizing Mask', 'Deep conditioning spa mask enriched with Moroccan Argan oil and Red Onion extract for strength.', 1099, 899, 'REPAIR', true, 35, false, 4.8, 115, 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&auto=format&fit=crop&q=80'),
('Amla & Vitamin E Shine Hair Serum', 'Lightweight anti-frizz serum that seals split ends and gives hair luminous high-gloss shine.', 649, 549, 'SMOOTHING', false, 55, false, 4.7, 82, 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&auto=format&fit=crop&q=80'),

('Velvet Jasmine & Shea Body Butter', 'Rich whip of raw Shea Butter and Night-Blooming Jasmine oil for 48-hour velvety soft hydration.', 1199, 999, 'RICH MOISTURE', false, 45, true, 4.9, 230, 'https://images.unsplash.com/photo-1556228722-d1191e3266ec?w=600&auto=format&fit=crop&q=80'),
('Coffee Bean & Cocoa Exfoliating Body Scrub', 'Freshly ground Arabica coffee and natural sugar crystals scrub to polish skin and target cellulite.', 849, 699, 'DETOX', false, 50, true, 4.9, 160, 'https://images.unsplash.com/photo-1567928257065-c14669877d84?w=600&auto=format&fit=crop&q=80'),
('Wild Rose & Almond Softening Body Lotion', 'Silky quick-absorbing body lotion infused with cold-pressed almond oil and wild rose essence.', 749, 629, 'DAILY CARE', false, 75, false, 4.8, 140, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'),
('Eucalyptus & Lemongrass Refreshing Wash', 'Energizing aromatherapeutic body wash that revives senses and leaves skin fresh and supple.', 599, 499, 'SPA FRESH', false, 85, false, 4.7, 90, 'https://images.unsplash.com/photo-1585232351009-aa87416fca90?w=600&auto=format&fit=crop&q=80'),

('Organic Honey & Vanilla Lip Butter', 'Ultra-soothing treatment balm crafted with raw honey, beeswax, and pure vanilla pod extract.', 399, 349, 'NOURISHING', false, 100, true, 4.9, 310, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80'),
('Rosehip & Peptide Overnight Eye Cream', 'Advanced eye treatment that visibly reduces dark circles, puffiness, and crow’s feet overnight.', 1399, 1199, 'ANTI-DARK CIRCLE', true, 40, true, 4.8, 120, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80'),
('Tinted Beetroot & Cocoa Butter Lip Balm', 'Natural rosy pink tint infused with beetroot extract and ultra-moisturizing cocoa butter.', 449, 379, 'NATURAL TINT', false, 90, false, 4.8, 185, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80'),
('Cucumber & Matcha Cooling Eye Gel', 'Refreshing eye contour gel with cucumber extract and Japanese matcha to de-puff tired eyes.', 999, 849, 'SOOTHING', true, 50, false, 4.9, 105, 'https://images.unsplash.com/photo-1608248597261-e4d044696386?w=600&auto=format&fit=crop&q=80')
ON CONFLICT (name) DO NOTHING;

-- Map product categories
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE title = 'Skincare') WHERE name IN ('Golden Botanical Elixir Face Oil', 'Organic Neem & Tea Tree Cleansing Gel', 'Prakriti Rose & Aloe Revitalizing Mist', 'Kumkumadi Radiant Glow Night Serum', 'Saffron & Sandalwood Youth Repair Cream', 'Green Tea & Hyaluronic Clarifying Concentrate', 'Radiant Botanical Sunscreen Gel SPF 50', 'Botanical Detox Clarifying Clay Mask');
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE title = 'Haircare') WHERE name IN ('Brahmi & Bhringraj Nourishing Hair Oil', 'Hibiscus & Coconut Intense Moisture Shampoo', 'Argan & Onion Scalp Revitalizing Mask', 'Amla & Vitamin E Shine Hair Serum');
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE title = 'Body Care') WHERE name IN ('Velvet Jasmine & Shea Body Butter', 'Coffee Bean & Cocoa Exfoliating Body Scrub', 'Wild Rose & Almond Softening Body Lotion', 'Eucalyptus & Lemongrass Refreshing Wash');
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE title = 'Lip & Eye Care') WHERE name IN ('Organic Honey & Vanilla Lip Butter', 'Rosehip & Peptide Overnight Eye Cream', 'Tinted Beetroot & Cocoa Butter Lip Balm', 'Cucumber & Matcha Cooling Eye Gel');

-- Flash Sale
INSERT INTO public.sales (title, discount, enddate, image) VALUES
('Prakriti Monsoon Botanical Glow Sale', 'FLAT 35% OFF', NOW() + INTERVAL '7 days', 'assets/hero_waterfall.jpg')
ON CONFLICT DO NOTHING;

-- Banners
INSERT INTO public.banners (title, subtitle, image, link, active) VALUES
('Prakriti Botanical Rituals', 'Pure Nature, Uncompromised Beauty', 'assets/hero_waterfall.jpg', '#shop', true)
ON CONFLICT DO NOTHING;

-- Site Settings
INSERT INTO public.settings (key, value) VALUES 
('top_bar_message', '🌿 Monsoon Organic Glow Sale — Buy Any 3 Botanical Luxuries At ₹999 + Free Express Shipping') 
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==========================================
-- 3. PERMISSIVE POLICIES FOR FAST FRONTEND & BACKEND ACCESS
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

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO UPDATE SET public = true;
