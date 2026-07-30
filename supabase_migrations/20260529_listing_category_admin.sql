-- Run in Supabase SQL Editor if you already applied supabase_setup.sql earlier.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'vegetables'
  CHECK (category IN ('vegetables', 'fruits', 'grains', 'spices', 'pulses', 'other'));

DROP POLICY IF EXISTS "Admins can insert listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can update listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can delete listings" ON public.listings;

CREATE POLICY "Admins can insert listings" ON public.listings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update listings" ON public.listings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete listings" ON public.listings FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
