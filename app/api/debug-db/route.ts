import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
    }
    
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
            .from('contractors')
            .select('id, name, category')
            .limit(3);
        
        if (error) {
            return NextResponse.json({
                error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            }, { status: 500 });
        }
        
        return NextResponse.json({ 
            success: true, 
            count: data?.length || 0,
            contractors: data 
        });
    } catch (err: any) {
        return NextResponse.json({ 
            error: err.message,
            type: err.type
        }, { status: 500 });
    }
}
