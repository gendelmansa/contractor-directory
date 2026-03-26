import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const category = searchParams.get('category');
        const query = searchParams.get('query');
        
        let dbQuery = supabase
            .from('contractors')
            .select('id, name, category, address, city, state, zip_code, rating, review_count, phone')
            .limit(Math.min(limit, 100));
        
        if (category) {
            dbQuery = dbQuery.eq('category', category);
        }
        
        if (query) {
            dbQuery = dbQuery.or(`name.ilike.%${query}%,address.ilike.%${query}%`);
        }
        
        const { data, error } = await dbQuery;
        
        if (error) {
            return NextResponse.json({
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({ 
            data: data,
            count: data?.length || 0
        });
    } catch (err: any) {
        return NextResponse.json({
            error: err.message
        }, { status: 500 });
    }
}
