import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMIT } from './validation';

// In-memory rate limiter
// WARNING: This implementation does not work correctly in serverless environments
// (e.g., Vercel, AWS Lambda) because each function invocation has its own memory.
// For production, use Redis or a similar distributed store.
//
// Map<ip, {count, resetTime}>
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiter middleware
 * Returns true if request should be allowed, false if rate limited
 */
export function checkRateLimit(request: NextRequest): boolean {
    // Get client IP (handle proxies)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
        || request.headers.get('x-real-ip') 
        || 'unknown';
    
    const now = Date.now();
    const record = rateLimitMap.get(ip);
    
    if (!record || now > record.resetTime) {
        // New window
        rateLimitMap.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT.windowMs
        });
        return true;
    }
    
    if (record.count >= RATE_LIMIT.maxRequests) {
        // Rate limited
        return false;
    }
    
    // Increment count
    record.count++;
    return true;
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(request: NextRequest): Record<string, string> {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
        || request.headers.get('x-real-ip') 
        || 'unknown';
    
    const record = rateLimitMap.get(ip);
    const remaining = record ? Math.max(0, RATE_LIMIT.maxRequests - record.count) : RATE_LIMIT.maxRequests;
    const reset = record ? Math.ceil((record.resetTime - Date.now()) / 1000) : Math.ceil(RATE_LIMIT.windowMs / 1000);
    
    return {
        'X-RateLimit-Limit': String(RATE_LIMIT.maxRequests),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
    };
}

/**
 * Rate limit error response
 */
export function rateLimitError(request: NextRequest): NextResponse {
    return NextResponse.json(
        {
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil(RATE_LIMIT.windowMs / 1000)
        },
        {
            status: 429,
            headers: getRateLimitHeaders(request)
        }
    );
}
