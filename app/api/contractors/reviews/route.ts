import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyA9Jm772telKqppzaofSHPcbn3RB5RNYr8';

// Get reviews for a place
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const city = searchParams.get('city');

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    // First find the place
    const query = encodeURIComponent(`${name}, ${city || ''}`);
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id&key=${GOOGLE_PLACES_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.candidates || searchData.candidates.length === 0) {
      return NextResponse.json({ reviews: [] });
    }

    const placeId = searchData.candidates[0].place_id;

    // Then get reviews
    const reviewsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}`;
    
    const reviewsResponse = await fetch(reviewsUrl);
    const reviewsData = await reviewsResponse.json();

    if (!reviewsData.result || !reviewsData.result.reviews) {
      return NextResponse.json({ reviews: [] });
    }

    // Transform reviews to our format
    const reviews = reviewsData.result.reviews.slice(0, 10).map((r: any) => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      date: r.relative_time_description,
    }));

    return NextResponse.json({ reviews });

  } catch (error: any) {
    console.error('Google Reviews API error:', error);
    return NextResponse.json({ reviews: [], error: error.message });
  }
}