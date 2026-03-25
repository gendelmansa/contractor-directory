-- Database Schema for Contractor Directory
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contractors table
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,  -- plumber, electrician, hvac, roofer, landscaper, painter, carpenter, cleaner
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone TEXT,
    website TEXT,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    source TEXT,  -- yelp, yellowpages, angi, etc.
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for search performance
CREATE INDEX idx_contractors_location ON contractors(city, state, zip_code);
CREATE INDEX idx_contractors_category ON contractors(category);
CREATE INDEX idx_contractors_rating ON contractors(rating DESC);
CREATE INDEX idx_contractors_coordinates ON contractors(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public read access (anyone can search contractors)
CREATE POLICY "Public read access" ON contractors
    FOR SELECT
    USING (true);

-- Service role write access (for backend operations)
CREATE POLICY "Service role can insert" ON contractors
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Service role write access (for backend operations)
CREATE POLICY "Service role can update" ON contractors
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- Service role delete access
CREATE POLICY "Service role can delete" ON contractors
    FOR DELETE
    USING (auth.role() = 'service_role');

-- Optional: Add a function to calculate distance for proximity searches
CREATE OR REPLACE FUNCTION get_contractors_nearby(
    search_lat DECIMAL(9,6),
    search_lng DECIMAL(9,6),
    radius_miles INTEGER DEFAULT 10,
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    phone TEXT,
    website TEXT,
    rating DECIMAL(3,2),
    review_count INTEGER,
    distance_miles DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.category,
        c.address,
        c.city,
        c.state,
        c.zip_code,
        c.phone,
        c.website,
        c.rating,
        c.review_count,
        (6371 * acos(
            cos(radians(search_lat)) * cos(radians(c.latitude)) *
            cos(radians(c.longitude) - radians(search_lng)) +
            sin(radians(search_lat)) * sin(radians(c.latitude))
        )) AS distance_miles  -- 6371 is Earth's radius in km
    FROM contractors c
    WHERE c.latitude IS NOT NULL 
      AND c.longitude IS NOT NULL
      AND (category_filter IS NULL OR c.category = category_filter)
      AND (6371 * acos(
            cos(radians(search_lat)) * cos(radians(c.latitude)) *
            cos(radians(c.longitude) - radians(search_lng)) +
            sin(radians(search_lat)) * sin(radians(c.latitude))
        )) <= radius_miles
    ORDER BY distance_miles ASC
    LIMIT limit_count;
END;
$$;

-- Helper function for distance in miles (for simpler queries)
CREATE OR REPLACE FUNCTION distance_miles(
    lat1 DECIMAL(9,6),
    lng1 DECIMAL(9,6),
    lat2 DECIMAL(9,6),
    lng2 DECIMAL(9,6)
)
RETURNS DOUBLE PRECISION
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (6371 * acos(
        cos(radians(lat1)) * cos(radians(lat2)) *
        cos(radians(lng2) - radians(lng1)) +
        sin(radians(lat1)) * sin(radians(lat2))
    )) * 0.621371;  -- Convert km to miles
END;
$$;

-- Sample data (optional - for testing)
-- INSERT INTO contractors (name, category, address, city, state, zip_code, phone, rating, review_count, source, latitude, longitude)
-- VALUES 
--     ('Quick Fix Plumbing', 'plumber', '123 Main St', 'Springfield', 'IL', '62701', '(555) 123-4567', 4.5, 230, 'yelp', 40.7128, -74.0060),
--     ('Spark Electric', 'electrician', '456 Oak Ave', 'Springfield', 'IL', '62702', '(555) 234-5678', 4.8, 156, 'angi', 40.7580, -73.9855);
