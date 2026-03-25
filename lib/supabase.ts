import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Always read from process.env at runtime (not build time)
function getEnv(key: string): string {
    if (typeof process === 'undefined' || !process.env) {
        throw new Error('Environment not available');
    }
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}

// Create fresh client every time - no caching issues
function createSupabaseClient(): SupabaseClient {
    const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return createClient(supabaseUrl, supabaseAnonKey);
}

// Public client for client-side operations
export function getSupabase(): SupabaseClient {
    return createSupabaseClient();
}

// Admin client for server-side operations (bypasses RLS)
export function getSupabaseAdmin(): SupabaseClient {
    const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
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
