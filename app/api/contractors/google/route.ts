import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyA9Jm772telKqppzaofSHPcbn3RB5RNYr8';

// Search for businesses and get their details
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const address = searchParams.get('address');
  const city = searchParams.get('city');

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // Build search query
  const query = encodeURIComponent(`${name}, ${city || address}`);
  const fields = 'place_id,name,rating,user_ratings_total,formatted_phone_number,website,address_components,photos';

  try {
    // Search for the place
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.candidates || searchData.candidates.length === 0) {
      return NextResponse.json({ data: null, message: 'Place not found' });
    }

    const place = searchData.candidates[0];

    return NextResponse.json({
      data: {
        name: place.name,
        rating: place.rating || null,
        review_count: place.user_ratings_total || null,
        phone: place.formatted_phone_number || null,
        website: place.website || null,
        place_id: place.place_id,
      },
      source: 'Google Places',
    });

  } catch (error: any) {
    console.error('Google Places API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}