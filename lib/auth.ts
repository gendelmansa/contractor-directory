import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Client-side Supabase (for useClient components)
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
}

// Auth helpers (client-side)
export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, metadata: { role: 'operator' | 'contractor', company_name?: string, contact_name?: string }) {
  const supabase = getSupabaseClient();
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: { data: metadata }
  });
}

export async function signOut() {
  const supabase = getSupabaseClient();
  return await supabase.auth.signOut();
}

export async function getUser() {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export type UserRole = 'operator' | 'contractor';

export function getUserRole(user: any): UserRole {
  return user?.user_metadata?.role || 'contractor';
}