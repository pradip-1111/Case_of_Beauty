-- SUPABASE FIX SCRIPT v3 - Case of Beauty
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the 'users' table if it doesn't exist 
-- (Your app uses a custom table, not the built-in Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Repair 'orders' and 'addresses' foreign keys
-- We need to drop the old foreign keys if they point to auth.users
-- This is a bit tricky in a single script, so we'll drop and recreate the columns if needed
-- or just update the reference.

-- Drop the problematic foreign key if it exists (pointing to auth.users)
-- Note: Supabase might have named the constraint 'orders_user_id_fkey'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.addresses DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;

-- Now link them to the CORRECT table (public.users)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

-- Ensure other columns exist in 'orders'
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS product_id UUID,
ADD COLUMN IF NOT EXISTS product_name TEXT DEFAULT 'Product',
ADD COLUMN IF NOT EXISTS product_image TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS customer_email TEXT DEFAULT 'customer@example.com',
ADD COLUMN IF NOT EXISTS shipping_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_state TEXT,
ADD COLUMN IF NOT EXISTS shipping_pincode TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Enable RLS and Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on categories" ON public.categories;
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;

-- Since we are not using Supabase Auth (auth.uid()), we should ideally use a different RLS approach 
-- OR switch the app to Supabase Auth. 
-- For now, to FIX the error immediately, we will allow all operations but you should 
-- enable proper RLS once you switch to Supabase Auth.
DROP POLICY IF EXISTS "Allow all for orders" ON public.orders;
CREATE POLICY "Allow all for orders" ON public.orders FOR ALL USING (true);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for addresses" ON public.addresses;
CREATE POLICY "Allow all for addresses" ON public.addresses FOR ALL USING (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for users" ON public.users;
CREATE POLICY "Allow all for users" ON public.users FOR ALL USING (true);
