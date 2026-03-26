import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { checkRateLimit, getRateLimitHeaders, rateLimitError } from '@/lib/rateLimit';

// GET /api/contractors/:id - Get single contractor
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Apply rate limiting
    if (!checkRateLimit(request)) {
        return rateLimitError(request);
    }

    try {
        const { id } = await params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { error: 'Invalid ID format' },
                { status: 400, headers: getRateLimitHeaders(request) }
            );
        }

        const { data, error } = await getSupabase()
            .from('contractors')
            .select('id, name, category, address, city, state, zip_code, rating, review_count, website, logo')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Not found', message: 'Contractor not found' },
                    { status: 404, headers: getRateLimitHeaders(request) }
                );
            }
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Database operation failed' },
                { status: 500, headers: getRateLimitHeaders(request) }
            );
        }

        return NextResponse.json({
            data
        }, {
            headers: getRateLimitHeaders(request)
        });

    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Database operation failed' },
            { status: 500, headers: getRateLimitHeaders(request) }
        );
    }
}
