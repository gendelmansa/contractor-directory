import { NextRequest, NextResponse } from 'next/server';

// Fetch contractors from OpenStreetMap Overpass API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'hardware';
  const limit = parseInt(searchParams.get('limit') || '15');

  // Map our categories to OSM tags - search more broadly
  const categoryTags: Record<string, string> = {
    plumber: 'shop=hardware',
    electrician: 'shop=hardware',
    hvac: 'shop=hardware',
    roofer: 'shop=hardware',
    landscaper: 'shop=hardware',
    painter: 'shop=hardware',
    carpenter: 'shop=hardware',
    cleaner: 'shop=hardware',
    hardware: 'shop=doityourself',
  };

  const osmTag = categoryTags[category] || 'shop=doityourself';

  // Use smaller bounding box for faster queries (Detroit/Metro area)
  const query = `
    [out:json][timeout:45][maxsize:15000000];
    (
      node["${osmTag}"]["name"](42.0,-84.0,43.0,-82.5);
      way["${osmTag}"]["name"](42.0,-84.0,43.0,-82.5);
    );
    out center ${limit};
  `;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ error: 'OSM API error', data: [] }, { status: 200 });
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Parse error', data: [] }, { status: 200 });
    }

    if (!data.elements || data.elements.length === 0) {
      return NextResponse.json({ data: [], source: 'OpenStreetMap' });
    }

    // Transform OSM data to our format
    const contractors = data.elements
      .filter((el: any) => el.tags && el.tags.name)
      .slice(0, limit)
      .map((el: any) => ({
        name: el.tags.name,
        category: category,
        address: el.tags['addr:housenumber'] && el.tags['addr:street']
          ? `${el.tags['addr:housenumber']} ${el.tags['addr:street']}`
          : el.tags['addr:street'] || '',
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
    console.error('OSM fetch error:', error.message);
    return NextResponse.json({ data: [], error: error.message }, { status: 200 });
  }
}