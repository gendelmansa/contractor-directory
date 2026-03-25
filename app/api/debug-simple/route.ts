import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabase();
        
        const { data, error } = await supabase
            .from('contractors')
            .select('id, name, category, address, city, state, zip_code, rating')
            .limit(5);
        
        if (error) {
            return NextResponse.json({
                source: 'getSupabase',
                error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                envCheck: {
                    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
                    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET'
                }
            }, { status: 500 });
        }
        
        return NextResponse.json({ 
            success: true, 
            count: data?.length || 0,
            contractors: data 
        });
    } catch (err: any) {
        return NextResponse.json({
            source: 'catch',
            error: err.message,
            stack: err.stack?.slice(0, 500),
            envCheck: {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
                key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET'
            }
        }, { status: 500 });
    }
}
