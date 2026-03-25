export default function Home() {
  const pageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contractor Directory - Find Local Home Services</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background: #f5f5f5; color: #333; line-height: 1.6; }
        header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 2rem 1rem; text-align: center; }
        header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        header p { opacity: 0.9; }
        .container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
        .search-section { background: white; border-radius: 12px; padding: 1.5rem; margin: -1.5rem auto 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; }
        .search-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: end; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { font-weight: 600; margin-bottom: 0.5rem; font-size: 0.875rem; color: #555; }
        .form-group input, .form-group select { padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background: #2563eb; color: white; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #f3f4f6; color: #333; }
        .btn-secondary:hover { background: #e5e7eb; }
        .location-status { font-size: 0.875rem; color: #666; margin-top: 0.5rem; }
        .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .results-count { color: #666; }
        .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
        .listing-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; }
        .listing-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .listing-name { font-size: 1.25rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem; }
        .listing-services { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
        .service-tag { background: #e0e7ff; color: #3730a3; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .listing-rating { color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem; }
        .listing-rating .stars { color: #f59e0b; }
        .listing-distance { color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem; }
        .listing-address { color: #4b5563; font-size: 0.875rem; }
        .listing-phone { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb; color: #2563eb; font-weight: 600; }
        .listing-source { font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem; }
        .no-results { text-align: center; padding: 3rem; color: #6b7280; }
        .loading { text-align: center; padding: 2rem; color: #6b7280; }
        .error-message { background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
        @media (max-width: 768px) { .search-form { grid-template-columns: 1fr; } .listings-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <header>
        <h1>🏠 Contractor Directory</h1>
        <p>Find trusted local home service professionals near you</p>
    </header>
    <div class="container">
        <div class="search-section">
            <form class="search-form" id="searchForm">
                <div class="form-group">
                    <label for="serviceType">Service Type</label>
                    <select id="serviceType">
                        <option value="">All Services</option>
                        <option value="plumber">Plumber</option>
                        <option value="electrician">Electrician</option>
                        <option value="hvac">HVAC Technician</option>
                        <option value="roofer">Roofer</option>
                        <option value="landscaper">Landscaper</option>
                        <option value="painter">Painter</option>
                        <option value="carpenter">Carpenter</option>
                        <option value="cleaner">Cleaner</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="companyName">Company Name</label>
                    <input type="text" id="companyName" placeholder="Search by name...">
                </div>
                <div class="form-group">
                    <label for="radius">Search Radius</label>
                    <select id="radius">
                        <option value="5">5 miles</option>
                        <option value="10" selected>10 miles</option>
                        <option value="25">25 miles</option>
                        <option value="50">50 miles</option>
                    </select>
                </div>
                <div class="form-group">
                    <button type="button" class="btn btn-secondary" id="useLocationBtn">📍 Use My Location</button>
                    <div class="location-status" id="locationStatus"></div>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">🔍 Search</button>
                </div>
            </form>
        </div>
        <div class="error-message" id="errorMessage" style="display: none;"></div>
        <div class="results-header"><span class="results-count" id="resultsCount"></span></div>
        <div class="listings-grid" id="listingsGrid"><div class="no-results"><p>Enter your location and search criteria to find contractors near you.</p></div></div>
    </div>
    <script>
        const API_BASE_URL = '/api/contractors';
        let userLat = null, userLng = null;
        
        function calculateDistance(lat1, lng1, lat2, lng2) {
            if (!lat2 || !lng2) return null;
            const R = 3959, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        }
        
        function getUserLocation() {
            const statusEl = document.getElementById('locationStatus'), btn = document.getElementById('useLocationBtn');
            if (!navigator.geolocation) { statusEl.textContent = 'Geolocation not supported'; return; }
            statusEl.textContent = 'Getting location...'; btn.disabled = true;
            navigator.geolocation.getCurrentPosition((p) => { userLat = p.coords.latitude; userLng = p.coords.longitude; statusEl.textContent = 'Location found!'; btn.textContent = '📍 Location Set'; btn.disabled = true; }, (e) => { statusEl.textContent = 'Error: ' + e.message; btn.disabled = false; });
        }
        
        function escapeHtml(t) { if (t == null) return ''; const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
        
        function formatRating(r) { if (!r) return ''; return '<span class="stars">' + '★'.repeat(Math.floor(r)) + '☆'.repeat(5-Math.floor(r)) + '</span> (' + r.toFixed(1) + ')'; }
        
        async function searchContractors() {
            const st = document.getElementById('serviceType').value, cn = document.getElementById('companyName').value, r = parseInt(document.getElementById('radius').value);
            const rc = document.getElementById('resultsCount'), lg = document.getElementById('listingsGrid'), em = document.getElementById('errorMessage');
            em.style.display = 'none'; lg.innerHTML = '<div class="loading">Loading...</div>';
            try {
                const params = new URLSearchParams();
                if (st) params.append('category', st);
                if (cn) params.append('query', cn);
                if (userLat && userLng) { params.append('lat', userLat); params.append('lng', userLng); params.append('radius', r); }
                params.append('limit', '50');
                const res = await fetch(API_BASE_URL + '?' + params);
                if (!res.ok) throw new Error((await res.json()).message || 'Error');
                const result = await res.json();
        let contractors = result.data || [];
                if (!contractors.length) { lg.innerHTML = '<div class="no-results"><p>No contractors found. Try expanding your search.</p></div>'; return; }
                rc.textContent = contractors.length + ' contractor' + (contractors.length !== 1 ? 's' : '') + ' found';
                if (!contractors.length) { lg.innerHTML = '<div class="no-results"><p>No contractors found. Try expanding your search.</p></div>'; return; }
                lg.innerHTML = contractors.map(c => '<div class="listing-card"><div class="listing-name">' + escapeHtml(c.name) + '</div><div class="listing-services"><span class="service-tag">' + escapeHtml(c.category) + '</span></div>' + (c.rating ? '<div class="listing-rating">' + formatRating(c.rating) + (c.review_count ? ' (' + c.review_count + ')' : '') + '</div>' : '') + (c.distance ? '<div class="listing-distance">📍 ' + c.distance.toFixed(1) + ' miles</div>' : '') + '<div class="listing-address">' + escapeHtml(c.address || '') + (c.city ? ', ' + escapeHtml(c.city) : '') + (c.state ? ', ' + escapeHtml(c.state) : '') + '</div>' + (c.phone ? '<div class="listing-phone">📞 ' + escapeHtml(c.phone) + '</div>' : '') + '</div>').join('');
            } catch (e) { em.textContent = 'Error: ' + e.message; em.style.display = 'block'; lg.innerHTML = '<div class="no-results"><p>Unable to load. Please try again.</p></div>'; }
        }
        
        document.getElementById('useLocationBtn').addEventListener('click', getUserLocation);
        document.getElementById('searchForm').addEventListener('submit', (e) => { e.preventDefault(); searchContractors(); });
        
        // Load all contractors by default on page load
        searchContractors();
    </script>
</body>
</html>`;

  return (
    <div dangerouslySetInnerHTML={{ __html: pageContent }} />
  );
}
