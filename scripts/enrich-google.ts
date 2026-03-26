// Script to enrich contractor data with Google Places ratings
// Run this to update all contractors with real Google ratings

export async function enrichContractors() {
  const API_KEY = 'AIzaSyA9Jm772telKqppzaofSHPcbn3RB5RNYr8';
  
  // First get all contractors
  const contractorsResponse = await fetch(
    'https://bvoaijksstjzseiywylf.supabase.co/rest/v1/contractors?select=*',
    {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2b2Fpamtzc3RqenNlaXl3eWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0Njc3NjksImV4cCI6MjA5MDA0Mzc2OX0.vtM9V0knv9rwbFE4PkRHAtCW5puIXVHHaU8K8ddoANk',
      }
    }
  );
  
  const contractors = await contractorsResponse.json();
  console.log(`Found ${contractors.length} contractors to enrich`);
  
  let updated = 0;
  
  for (const contractor of contractors) {
    const query = encodeURIComponent(`${contractor.name}, ${contractor.city}, ${contractor.state}`);
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total&key=${API_KEY}`;
    
    try {
      const resp = await fetch(searchUrl);
      const data = await resp.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const place = data.candidates[0];
        
        if (place.rating) {
          // Update the contractor with Google data
          await fetch(
            `https://bvoaijksstjzseiywylf.supabase.co/rest/v1/contractors?id=eq.${contractor.id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2b2Fpamtzc3RqenNlaXl3eWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0Njc3NjksImV4cCI6MjA5MDA0Mzc2OX0.vtM9V0knv9rwbFE4PkRHAtCW5puIXVHHaU8K8ddoANk',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2b2Fpamtzc3RqenNlaXl3eWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ2Nzc2OSwiZXhwIjoyMDkwMDQzNzY5fQ.c7dGK9j8XSLWeSWWAKOD3jURSwABHkDBgU2MkobeNXw',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                rating: place.rating,
                review_count: place.user_ratings_total,
              }),
            }
          );
          
          console.log(`Updated ${contractor.name}: ${place.rating}★ (${place.user_ratings_total} reviews)`);
          updated++;
        }
      }
      
      // Be nice to Google's API (rate limit)
      await new Promise(r => setTimeout(r, 100));
      
    } catch (e) {
      console.error(`Error for ${contractor.name}:`, e);
    }
  }
  
  console.log(`\n✅ Updated ${updated} contractors with Google ratings!`);
}

// Uncomment to run directly:
// enrichContractors();