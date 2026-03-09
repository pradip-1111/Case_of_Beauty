-- SITE SETTINGS SETUP
-- Run this in your Supabase SQL Editor to enable Top Bar control without resetting your entire database.

-- 1. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Insert Default Value
INSERT INTO public.settings (key, value) 
VALUES ('top_bar_message', 'Buy Any 3 At ₹999') 
ON CONFLICT (key) DO NOTHING;

-- 3. Enable Security
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 4. Create Policy (Allow all for now, synchronized with your project style)
DROP POLICY IF EXISTS "Permissive" ON public.settings;
CREATE POLICY "Permissive" ON public.settings FOR ALL USING (true);
