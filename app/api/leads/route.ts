import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, category, city, message } = body;

        if (!name || !email || !category || !city) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('leads')
            .insert({
                name,
                email,
                phone,
                category,
                city,
                message,
                status: 'new'
            })
            .select()
            .single();

        if (error) {
            console.error('Lead insert error:', error);
            // Still return success to not leak DB errors to client
            return NextResponse.json({ success: true, message: 'Request received' });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('Lead API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
