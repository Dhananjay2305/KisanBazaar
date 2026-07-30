# Deploy FarmDirect on Vercel (with image uploads)

## 1. Supabase setup (one time)

1. Open your [Supabase](https://supabase.com) project → **SQL Editor**.
2. Run the full script from `supabase_setup.sql` (creates tables + **produce** and **avatars** storage buckets).

## 2. Vercel environment variables

In **Vercel → your project → Settings → Environment Variables**, add:

| Name | Value | Notes |
|------|--------|--------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | From Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon public) | Same page |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role) | **Secret** — enables `/api/upload-image` on Vercel |

Apply to **Production**, **Preview**, and **Development**.

If your database was created before product categories/admin policies, also run `supabase_migrations/20260529_listing_category_admin.sql` in the Supabase SQL Editor.

## 3. Redeploy

After saving env vars, trigger a **Redeploy** so Vite embeds `VITE_*` values in the build.

## 4. Test image upload

1. Open your Vercel URL → log in as a **farmer**.
2. **Add Listing** → choose an image → **Create Listing**.
3. The listing card should show your photo (Supabase Storage URL).

If upload fails, open browser **DevTools → Console** and check for errors. Common fixes:

- Missing `SUPABASE_SERVICE_ROLE_KEY` on Vercel
- Storage section of `supabase_setup.sql` not run
- Session expired — log out and log in again

## How uploads work on Vercel

1. Browser uploads directly to Supabase Storage (fastest).
2. If that fails, the app calls **`/api/upload-image`** on your Vercel domain (uses service role server-side).
3. Images are stored as public URLs in the `listings.image` column.

Local disk uploads (`backend/uploads`) do **not** work on Vercel; use Supabase Storage only.
