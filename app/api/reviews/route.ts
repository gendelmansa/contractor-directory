import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabase();
        const { searchParams } = new URL(request.url);
        const contractorId = searchParams.get('contractor_id');
        
        if (!contractorId) {
            return NextResponse.json({ error: 'contractor_id required' }, { status: 400 });
        }
        
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('contractor_id', contractorId)
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}