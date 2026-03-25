import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables should be set in your deployment platform
// For local development, use .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Create clients lazily to avoid build errors
let _supabase: SupabaseClient | null = null;

// Public client for client-side operations
export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabase;
}

// Admin client for server-side operations (bypasses RLS)
// This should only be called at runtime, not at build time
export function getSupabaseAdmin(): SupabaseClient {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
