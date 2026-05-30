import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using the provided Project URL and Anon Key
const supabaseUrl = 'https://igxncfvncspnwcuhhtch.supabase.co';
const supabaseAnonKey = 'sb_publishable_csqNwGtEyBTk8wo9FBAS6Q_IUfeLnHj';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
