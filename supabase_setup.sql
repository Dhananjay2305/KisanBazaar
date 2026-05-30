-- Supabase Setup Script for FarmDirect
-- This script is safe to run multiple times.

-- 0. Drop existing triggers to avoid "already exists" errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    role TEXT CHECK (role IN ('farmer', 'buyer', 'admin')) NOT NULL,
    location TEXT,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    crop_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    price NUMERIC NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    image TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'hidden')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    offer_price NUMERIC NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    items JSONB NOT NULL,
    shipping_address TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'shipped', 'delivered')) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')) NOT NULL,
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_id UUID,
    related_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES (Drop first to avoid errors, then recreate)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view listings" ON public.listings;
DROP POLICY IF EXISTS "Farmers can insert own listings" ON public.listings;
DROP POLICY IF EXISTS "Farmers can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Farmers can delete own listings" ON public.listings;
CREATE POLICY "Anyone can view listings" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Farmers can insert own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Users can view relevant offers" ON public.offers;
DROP POLICY IF EXISTS "Buyers can insert offers" ON public.offers;
DROP POLICY IF EXISTS "Relevant users can update offers" ON public.offers;
CREATE POLICY "Users can view relevant offers" ON public.offers FOR SELECT USING (
    auth.uid() = buyer_id OR 
    auth.uid() IN (SELECT farmer_id FROM public.listings WHERE id = listing_id)
);
CREATE POLICY "Buyers can insert offers" ON public.offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Relevant users can update offers" ON public.offers FOR UPDATE USING (
    auth.uid() = buyer_id OR 
    auth.uid() IN (SELECT farmer_id FROM public.listings WHERE id = listing_id)
);

DROP POLICY IF EXISTS "Users can view relevant orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Relevant users can update orders" ON public.orders;
CREATE POLICY "Users can view relevant orders" ON public.orders FOR SELECT USING (
    auth.uid() = buyer_id OR 
    (items @> format('[{"farmer_id": "%s"}]', auth.uid())::jsonb)
);
CREATE POLICY "Buyers can insert orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Relevant users can update orders" ON public.orders FOR UPDATE USING (
    auth.uid() = buyer_id OR 
    (items @> format('[{"farmer_id": "%s"}]', auth.uid())::jsonb)
);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 8. TRIGGER FOR NEW USER PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, role, phone, location)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'name', 'New User'), 
        COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
        COALESCE(new.raw_user_meta_data->>'phone', new.phone),
        new.raw_user_meta_data->>'location'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
