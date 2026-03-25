import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const keyPrefix = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) || 'NOT SET';
    
    return NextResponse.json({
        supabaseUrl: url || 'NOT SET',
        anonKeyPrefix: keyPrefix,
        anonKeyPresent: hasKey,
        nodeEnv: process.env.NODE_ENV,
    });
}
