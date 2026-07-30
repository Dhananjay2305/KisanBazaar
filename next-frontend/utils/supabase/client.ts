import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using the active Project URL and Anon Key
const supabaseUrl = 'https://addnaontkrvwgcotzjyy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZG5hb250a3J2d2djb3R6anl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTE5MzIsImV4cCI6MjA5NDIyNzkzMn0.RT6jDg8Nxwa3ozZ93yDmApd_np3nCIUJTMNcjFNbpQc';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
