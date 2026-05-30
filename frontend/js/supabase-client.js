import { createClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env?.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = String(import.meta.env?.VITE_SUPABASE_ANON_KEY ?? '').trim();

/** True when your project URL and anon key are set in `.env` (Vite). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// createClient('', '') throws ("supabaseUrl is required"), which prevents auth.js from ever
// registering click/hash handlers — so #register updates the URL but the UI stays on Login.
const fallbackUrl = 'https://example.supabase.co';
const fallbackAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

if (!isSupabaseConfigured) {
  console.warn(
    '[FarmDirect] Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env — using a placeholder client so the auth page UI still loads.'
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackAnonKey
);
