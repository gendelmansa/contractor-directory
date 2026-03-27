import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization - only creates client when called, not at module load
function getSupabaseClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }
    
    return createClient(supabaseUrl, supabaseAnonKey);
}

export async function getContractorsByCity(city: string, category?: string) {
    const supabase = getSupabaseClient();
    
    let query = supabase
        .from('contractors')
        .select('id, name, category, address, city, state, zip_code, phone, rating, review_count')
        .eq('city', city);
    
    if (category) {
        query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching contractors:', error);
        return [];
    }
    
    return data || [];
}

export async function getAllContractors(limit: number = 50) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
        .from('contractors')
        .select('id, name, category, address, city, state, zip_code, phone, rating, review_count')
        .limit(limit);
    
    if (error) {
        console.error('Error fetching contractors:', error);
        return [];
    }
    
    return data || [];
}