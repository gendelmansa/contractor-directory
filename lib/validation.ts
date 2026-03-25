import { z } from 'zod';

// Valid categories for contractors
export const CONTRACTOR_CATEGORIES = [
    'plumber',
    'electrician',
    'hvac',
    'roofer',
    'landscaper',
    'painter',
    'carpenter',
    'cleaner',
] as const;

export const CONTRACTOR_SOURCES = [
    'yelp',
    'yellowpages',
    'angi',
    'homeadvisor',
    'thumbtack',
    'google',
    'manual',
] as const;

// Zod schema for contractor input validation
export const contractorSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(255, "Name must be less than 255 characters")
        .trim(),
    category: z.string()
        .min(1, "Category is required")
        .refine(
            (val) => CONTRACTOR_CATEGORIES.includes(val as typeof CONTRACTOR_CATEGORIES[number]),
            { message: "Invalid category" }
        ),
    address: z.string()
        .max(500, "Address must be less than 500 characters")
        .optional(),
    city: z.string()
        .max(100, "City must be less than 100 characters")
        .optional(),
    state: z.string()
        .max(100, "State must be less than 100 characters")
        .optional(),
    zip_code: z.string()
        .max(20, "Zip code must be less than 20 characters")
        .optional(),
    phone: z.string()
        .max(30, "Phone must be less than 30 characters")
        .regex(/^[\d\s\-\(\)\+]*$/, "Invalid phone number format")
        .optional(),
    website: z.string()
        .url("Invalid website URL")
        .max(500, "Website must be less than 500 characters")
        .optional()
        .or(z.literal(''))
        .transform(val => val === '' ? undefined : val),
    rating: z.number()
        .min(0, "Rating must be at least 0")
        .max(5, "Rating must be at most 5")
        .optional(),
    review_count: z.number()
        .int("Review count must be an integer")
        .min(0, "Review count must be at least 0")
        .optional(),
    source: z.string()
        .refine(
            (val) => !val || CONTRACTOR_SOURCES.includes(val as typeof CONTRACTOR_SOURCES[number]),
            { message: "Invalid source" }
        )
        .optional(),
    latitude: z.number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .optional(),
    longitude: z.number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .optional(),
});

// Type inference from schema
export type ContractorInput = z.infer<typeof contractorSchema>;

// Search/filter parameters schema
export const searchParamsSchema = z.object({
    category: z.string()
        .refine(
            (val) => !val || CONTRACTOR_CATEGORIES.includes(val as typeof CONTRACTOR_CATEGORIES[number]),
            { message: "Invalid category" }
        )
        .optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    zip_code: z.string().max(20).optional(),
    query: z.string().max(255).optional(),
    minRating: z.number().min(0).max(5).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    radius: z.number().int().min(1).max(100).default(10),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

// Rate limiting configuration
export const RATE_LIMIT = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // Max requests per window
};
