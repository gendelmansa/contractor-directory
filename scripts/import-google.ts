// Script to find more contractors using Google Places API
// Searches for various contractor types in Michigan cities

const API_KEY = 'AIzaSyA9Jm772telKqppzaofSHPcbn3RB5RNYr8';

// Michigan cities to search
const CITIES = [
  { city: 'Detroit', state: 'MI' },
  { city: 'Ann Arbor', state: 'MI' },
  { city: 'Grand Rapids', state: 'MI' },
  { city: 'Lansing', state: 'MI' },
  { city: 'Flint', state: 'MI' },
  { city: 'Kalamazoo', state: 'MI' },
  { city: 'Saginaw', state: 'MI' },
  { city: 'Troy', state: 'MI' },
  { city: 'Southfield', state: 'MI' },
  { city: 'Sterling Heights', state: 'MI' },
];

const CATEGORIES = ['hardware store', 'plumber', 'electrician', 'hvac', 'roofing'];

async function searchGooglePlaces(query: string) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  const resp = await fetch(url);
  return await resp.json();
}

async function getPlaceDetails(placeId: string) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,formatted_phone_number,website&key=${API_KEY}`;
  const resp = await fetch(url);
  return await resp.json();
}

async function addToSupabase(contractor: any) {
  const url = 'https://bvoaijksstjzseiywylf.supabase.co/rest/v1/contractors';
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2b2Fpamtzc3RqenNlaXl3eWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ2Nzc2OSwiZXhwIjoyMDkwMDQzNzY5fQ.c7dGK9j8XSLWeSWWAKOD3jURSwABHkDBgU2MkobeNXw',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2b2Fpamtzc3RqenNlaXl3eWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ2Nzc2OSwiZXhwIjoyMDkwMDQzNzY5fQ.c7dGK9j8XSLWeSWWAKOD3jURSwABHkDBgU2MkobeNXw',
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(contractor)
  });
  return resp.ok;
}

async function main() {
  let added = 0;
  
  for (const { city, state } of CITIES) {
    console.log(`\n=== Searching ${city}, ${state} ===`);
    
    for (const category of CATEGORIES) {
      const query = `${category} in ${city}, ${state}`;
      console.log(`  Searching: ${category}...`);
      
      try {
        const results = await searchGooglePlaces(query);
        
        if (results.results) {
          for (const place of results.results.slice(0, 3)) { // Take top 3
            // Get details for rating
            const details = await getPlaceDetails(place.place_id);
            const result = details.result;
            
            // Parse address
            const addressParts = result.formatted_address?.split(',') || [];
            const address = addressParts[0] || '';
            const cityPart = addressParts[1]?.trim() || city;
            const stateZip = addressParts[2]?.trim() || state;
            const zip = stateZip?.match(/\d{5}/)?.[0] || '';
            
            const contractor = {
              name: result.name,
              category: category.replace(' store', ''),
              address: address,
              city: cityPart,
              state: 'MI',
              zip_code: zip,
              phone: result.formatted_phone_number || '',
              website: result.website || null,
              rating: result.rating || null,
              review_count: result.user_ratings_total || null,
              source: 'google_places'
            };
            
            const success = await addToSupabase(contractor);
            if (success) {
              console.log(`    ✓ Added: ${result.name} (${result.rating}★)`);
              added++;
            }
            
            await new Promise(r => setTimeout(r, 100)); // Rate limit
          }
        }
      } catch (e) {
        console.error(`  Error: ${e}`);
      }
    }
  }
  
  console.log(`\n✅ Added ${added} new contractors from Google Places!`);
}

main();