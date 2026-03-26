import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, phone, email, category, zip_code, description } = body;
        
        // Validate required fields
        if (!name || !phone || !category) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        
        // Create admin client to bypass RLS for inserts
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !serviceKey) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }
        
        const supabase = createClient(supabaseUrl, serviceKey);
        
        const { data, error } = await supabase
            .from('leads')
            .insert({
                name,
                phone,
                email: email || null,
                category,
                zip_code: zip_code || null,
                description: description || null,
                status: 'new'
            });
        
        if (error) {
            console.error('Lead insert error:', error);
            return NextResponse.json(
                { error: 'Failed to save lead' },
                { status: 500 }
            );
        }
        
        return NextResponse.json({
            success: true,
            message: 'Lead submitted successfully'
        });
        
    } catch (err: any) {
        console.error('Lead submission error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}