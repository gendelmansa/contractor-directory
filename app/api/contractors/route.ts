import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { searchParamsSchema, contractorSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitHeaders, rateLimitError } from '@/lib/rateLimit';

// GET /api/contractors - Search with filters
export async function GET(request: NextRequest) {
    // Apply rate limiting
    if (!checkRateLimit(request)) {
        return rateLimitError(request);
    }

    try {
        const { searchParams } = new URL(request.url);
        
        // Parse and validate search parameters
        const params = {
            category: searchParams.get('category') || undefined,
            city: searchParams.get('city') || undefined,
            state: searchParams.get('state') || undefined,
            zip_code: searchParams.get('zip_code') || undefined,
            query: searchParams.get('query') || undefined,
            minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
            lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
            lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
            radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
            offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
        };

        // Validate parameters
        const validatedParams = searchParamsSchema.parse(params);
        
        // Sanitize search query to prevent ILIKE injection
        const sanitizedQuery = (validatedParams.query || '')
            .replace(/[%_\\]/g, '\\$&')
            .slice(0, 255);

        let query = getSupabase()
            .from('contractors')
            .select('id, name, category, address, city, state, zip_code, rating, review_count, website, source, latitude, longitude');

        // Apply filters
        if (validatedParams.category) {
            query = query.eq('category', validatedParams.category);
        }
        
        if (validatedParams.city) {
            query = query.ilike('city', `%${validatedParams.city}%`);
        }
        
        if (validatedParams.state) {
            query = query.eq('state', validatedParams.state);
        }
        
        if (validatedParams.zip_code) {
            query = query.eq('zip_code', validatedParams.zip_code);
        }
        
        if (validatedParams.query) {
            query = query.or(`name.ilike.%${sanitizedQuery}%,address.ilike.%${sanitizedQuery}%`);
        }
        
        if (validatedParams.minRating) {
            query = query.gte('rating', validatedParams.minRating);
        }

        // Execute query with pagination
        const { data, error } = await query
            .order('rating', { ascending: false })
            .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Database operation failed' },
                { status: 500, headers: getRateLimitHeaders(request) }
            );
        }

        // If lat/lng provided, filter by distance manually
        let results = data || [];
        
        if (validatedParams.lat && validatedParams.lng && validatedParams.radius) {
            results = results
                .filter(c => c.latitude && c.longitude)
                .map(c => ({
                    ...c,
                    distance: calculateDistance(
                        validatedParams.lat!,
                        validatedParams.lng!,
                        c.latitude,
                        c.longitude
                    )
                }))
                .filter(c => c.distance <= validatedParams.radius)
                .sort((a, b) => a.distance - b.distance);
        }

        return NextResponse.json({
            data: results,
            pagination: {
                limit: validatedParams.limit,
                offset: validatedParams.offset,
                total: results.length
            }
        }, {
            headers: getRateLimitHeaders(request)
        });

    } catch (error: any) {
        console.error('Validation error:', error);
        
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400, headers: getRateLimitHeaders(request) }
            );
        }

        return NextResponse.json(
            { error: 'Database operation failed' },
            { status: 500, headers: getRateLimitHeaders(request) }
        );
    }
}

// POST /api/contractors - Add contractor (with Zod validation)
export async function POST(request: NextRequest) {
    // Apply rate limiting
    if (!checkRateLimit(request)) {
        return rateLimitError(request);
    }

    // API Key authentication
    const apiKey = request.headers.get('x-api-key');
    const validKey = process.env.POST_API_KEY;
    if (!apiKey || apiKey !== validKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate input using Zod
        const validatedData = contractorSchema.parse(body);

        // Insert into database
        const { data, error } = await getSupabaseAdmin()
            .from('contractors')
            .insert(validatedData)
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Database operation failed' },
                { status: 500, headers: getRateLimitHeaders(request) }
            );
        }

        return NextResponse.json({
            success: true,
            data
        }, {
            status: 201,
            headers: getRateLimitHeaders(request)
        });

    } catch (error: any) {
        console.error('Error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400, headers: getRateLimitHeaders(request) }
            );
        }

        return NextResponse.json(
            { error: 'Database operation failed' },
            { status: 500, headers: getRateLimitHeaders(request) }
        );
    }
}

// Haversine distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
