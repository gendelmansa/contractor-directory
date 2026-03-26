import { NextRequest, NextResponse } from 'next/server';

// Fetch contractors from OpenStreetMap Overpass API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'doityourself';
  const limit = parseInt(searchParams.get('limit') || '20');

  // Map our categories to OSM tags
  const categoryTags: Record<string, string> = {
    plumber: 'craft=plumber',
    electrician: 'craft=electrician',
    hvac: 'craft=hvac',
    roofer: 'craft=roofer',
    landscaper: 'landscape',
    painter: 'craft=painter',
    carpenter: 'craft=carpenter',
    cleaner: 'amenity=cleaning',
    hardware: 'shop=doityourself',
  };

  const osmTag = categoryTags[category] || 'shop=doityourself';

  // Query Michigan area
  const query = `
    [out:json][timeout:30][maxsize:20000000];
    area["name"="Michigan"]->.a;
    (
      node["${osmTag}"](area.a);
      way["${osmTag}"](area.a);
    );
    out center ${limit};
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) {
      throw new Error('OpenStreetMap API request failed');
    }

    const data = await response.json();

    // Transform OSM data to our format
    const contractors = data.elements
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any) => ({
        name: el.tags.name,
        category: category,
        address: el.tags['addr:housenumber'] && el.tags['addr:street']
          ? `${el.tags['addr:housenumber']} ${el.tags['addr:street']}`
          : '',
        city: el.tags['addr:city'] || '',
        state: el.tags['addr:state'] || 'MI',
        zip_code: el.tags['addr:postcode'] || '',
        phone: el.tags.phone || '',
        website: el.tags.website || null,
        rating: null,
        review_count: null,
        source: 'openstreetmap',
      }));

    return NextResponse.json({ data: contractors, source: 'OpenStreetMap' });
  } catch (error: any) {
    console.error('Error fetching from OSM:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}