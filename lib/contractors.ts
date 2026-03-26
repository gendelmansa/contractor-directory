import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getContractorsByCity(city: string, category?: string) {
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