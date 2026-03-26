export default function Home() {
  const pageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Michigan Contractors | Find Trusted Home Service Pros</title>
    <meta name="description" content="Find the best plumbers, electricians, HVAC, roofers and more in Michigan. Verified reviews, free quotes, and trusted professionals.">
    <style>
        :root {
            --primary: #0f172a;
            --primary-light: #1e293b;
            --accent: #3b82f6;
            --accent-hover: #2563eb;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --gray-50: #f8fafc;
            --gray-100: #f1f5f9;
            --gray-200: #e2e8f0;
            --gray-300: #cbd5e1;
            --gray-400: #94a3b8;
            --gray-500: #64748b;
            --gray-600: #475569;
            --gray-700: #334155;
            --gray-800: #1e293b;
            --gray-900: #0f172a;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --radius: 12px;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--gray-50); color: var(--gray-800); line-height: 1.6; }
        
        /* Nav */
        nav { background: white; border-bottom: 1px solid var(--gray-200); position: sticky; top: 0; z-index: 100; }
        .nav-inner { max-width: 1400px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 0.5rem; }
        .logo-icon { width: 40px; height: 40px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; }
        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a { color: var(--gray-600); text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: var(--accent); }
        .btn-nav { background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 500; }
        
        /* Hero */
        .hero { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); padding: 4rem 2rem; text-align: center; color: white; }
        .hero h1 { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
        .hero p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
        .hero-stats { display: flex; justify-content: center; gap: 3rem; margin-top: 2rem; }
        .stat { text-align: center; }
        .stat-number { font-size: 2rem; font-weight: 700; }
        .stat-label { font-size: 0.875rem; opacity: 0.8; }
        
        /* Search */
        .search-container { max-width: 900px; margin: -3rem auto 2rem; position: relative; z-index: 10; padding: 0 1rem; }
        .search-box { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-lg); }
        .search-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; align-items: end; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { font-weight: 600; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--gray-700); }
        .form-group select, .form-group input { padding: 0.875rem 1rem; border: 2px solid var(--gray-200); border-radius: 10px; font-size: 1rem; transition: border-color 0.2s; background: white; }
        .form-group select:focus, .form-group input:focus { outline: none; border-color: var(--accent); }
        .btn-search { background: var(--accent); color: white; padding: 0.875rem 2rem; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-search:hover { background: var(--accent-hover); }
        .btn-location { background: white; color: var(--gray-700); padding: 0.875rem 1rem; border: 2px solid var(--gray-200); border-radius: 10px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; width: 100%; }
        .btn-location:hover { border-color: var(--accent); color: var(--accent); }
        
        /* Categories */
        .categories-section { max-width: 1400px; margin: 3rem auto; padding: 0 2rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); }
        .see-all { color: var(--accent); text-decoration: none; font-weight: 500; }
        .categories-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
        .category-card { background: white; border-radius: var(--radius); padding: 1.5rem; text-align: center; border: 2px solid transparent; transition: all 0.2s; cursor: pointer; box-shadow: var(--shadow); }
        .category-card:hover { border-color: var(--accent); transform: translateY(-2px); }
        .category-icon { width: 60px; height: 60px; background: var(--gray-100); border-radius: 12px; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; }
        .category-name { font-weight: 600; color: var(--gray-800); margin-bottom: 0.25rem; }
        .category-count { font-size: 0.875rem; color: var(--gray-500); }
        
        /* Featured Listings */
        .listings-section { max-width: 1400px; margin: 3rem auto; padding: 0 2rem; }
        .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .listing-card { background: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); transition: all 0.2s; }
        .listing-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); }
        .listing-header { background: linear-gradient(135deg, var(--accent), var(--accent-hover)); padding: 1.25rem; color: white; }
        .listing-category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9; }
        .listing-name { font-size: 1.25rem; font-weight: 700; margin-top: 0.25rem; }
        .listing-body { padding: 1.25rem; }
        .listing-rating { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
        .stars { color: var(--warning); }
        .rating-value { font-weight: 600; }
        .review-count { color: var(--gray-500); font-size: 0.875rem; }
        .listing-info { display: flex; flex-direction: column; gap: 0.5rem; }
        .info-row { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.875rem; color: var(--gray-600); }
        .info-icon { width: 16px; flex-shrink: 0; }
        .btn-contact { display: block; width: 100%; background: var(--gray-100); color: var(--gray-800); text-align: center; padding: 0.875rem; border: none; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-contact:hover { background: var(--gray-200); }
        
        /* CTA */
        .cta-section { background: var(--primary); padding: 4rem 2rem; text-align: center; color: white; margin-top: 4rem; }
        .cta-section h2 { font-size: 2rem; margin-bottom: 1rem; }
        .cta-section p { opacity: 0.9; margin-bottom: 2rem; font-size: 1.125rem; }
        .btn-cta { background: var(--accent); color: white; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; text-decoration: none; display: inline-block; }
        
        /* Footer */
        footer { background: var(--gray-900); color: var(--gray-400); padding: 3rem 2rem; text-align: center; }
        footer a { color: var(--gray-300); }
        
        /* Lead Form Modal */
        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }
        .modal-overlay.active { display: flex; }
        .modal { background: white; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-title { font-size: 1.5rem; font-weight: 700; }
        .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray-500); }
        .lead-form { display: flex; flex-direction: column; gap: 1rem; }
        .lead-form input, .lead-form select, .lead-form textarea { padding: 0.875rem; border: 2px solid var(--gray-200); border-radius: 8px; font-size: 1rem; }
        .lead-form textarea { min-height: 100px; resize: vertical; }
        .btn-submit { background: var(--accent); color: white; padding: 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        
        /* Responsive */
        @media (max-width: 768px) {
            .search-grid { grid-template-columns: 1fr; }
            .categories-grid { grid-template-columns: repeat(2, 1fr); }
            .hero h1 { font-size: 2rem; }
            .hero-stats { flex-wrap: wrap; gap: 2rem; }
            .nav-links { display: none; }
        }
        
        .container { max-width: 1400px; margin: 0 auto; }
    </style>
</head>
<body>
    <nav>
        <div class="nav-inner">
            <div class="logo">
                <div class="logo-icon">🏠</div>
                MichiganContractors
            </div>
            <div class="nav-links">
                <a href="#">Home</a>
                <a href="#categories">Categories</a>
                <a href="#listings">Featured</a>
                <a href="#" class="btn-nav" onclick="openLeadModal()">Get Quote</a>
            </div>
        </div>
    </nav>

    <section class="hero">
        <h1>Find Trusted Contractors<br>Across Michigan</h1>
        <p>Connect with verified plumbers, electricians, HVAC pros, and more</p>
        <div class="hero-stats">
            <div class="stat">
                <div class="stat-number">130+</div>
                <div class="stat-label">Verified Contractors</div>
            </div>
            <div class="stat">
                <div class="stat-number">30+</div>
                <div class="stat-label">Cities Covered</div>
            </div>
            <div class="stat">
                <div class="stat-number">8</div>
                <div class="stat-label">Service Categories</div>
            </div>
        </div>
    </section>

    <div class="search-container">
        <div class="search-box">
            <div class="search-grid">
            <div class="form-group">
                <label>Service Type</label>
                <select id="categoryInput">
                    <option value="">All Services</option>
                    <option value="plumber">Plumbers</option>
                    <option value="electrician">Electricians</option>
                    <option value="hvac">HVAC</option>
                    <option value="roofer">Roofers</option>
                    <option value="landscaper">Landscapers</option>
                    <option value="painter">Painters</option>
                    <option value="carpenter">Carpenters</option>
                    <option value="cleaner">Cleaners</option>
                </select>
            </div>
            <div class="form-group">
                <label>City</label>
                <input type="text" id="cityInput" placeholder="e.g. Detroit, Ann Arbor">
            </div>
            <div class="form-group">
                <label>Or Use My Location</label>
                <button type="button" class="btn-location" onclick="getUserLocation()">
                    📍 Use My Location
                </button>
            </div>
            <button class="btn-search" onclick="searchContractors()">Search</button>
        </div>
        </div>
    </div>

    <section class="categories-section" id="categories">
        <div class="section-header">
            <h2 class="section-title">Browse by Service</h2>
            <a href="#" class="see-all">View all →</a>
        </div>
        <div class="categories-grid">
            <div class="category-card" onclick="filterCategory('plumber')">
                <div class="category-icon">🔧</div>
                <div class="category-name">Plumbing</div>
                <div class="category-count">30+ pros</div>
            </div>
            <div class="category-card" onclick="filterCategory('electrician')">
                <div class="category-icon">⚡</div>
                <div class="category-name">Electrical</div>
                <div class="category-count">25+ pros</div>
            </div>
            <div class="category-card" onclick="filterCategory('hvac')">
                <div class="category-icon">❄️</div>
                <div class="category-name">HVAC</div>
                <div class="category-count">20+ pros</div>
            </div>
            <div class="category-card" onclick="filterCategory('roofer')">
                <div class="category-icon">🏗️</div>
                <div class="category-name">Roofing</div>
                <div class="category-count">15+ pros</div>
            </div>
            <div class="category-card" onclick="filterCategory('landscaper')">
                <div class="category-icon">🌿</div>
                <div class="category-name">Landscaping</div>
                <div class="category-count">10+ pros</div>
            </div>
            <div class="category-card" onclick="filterCategory('painter')">
                <div class="category-icon">🎨</div>
                <div class="category-name">Painting</div>
                <div class="category-count">10+ pros</div>
            </div>
            <div class="category-card" onclick="filterCategory('carpenter')">
                <div class="category-icon">🪵</div>
                <div class="category-name">Carpentry</div>
                <div class="category-count">8+ pros</div>
            </div>
            <div class="category-card" onclick="filterCategory('cleaner')">
                <div class="category-icon">🧹</div>
                <div class="category-name">Cleaning</div>
                <div class="category-count">5+ pros</div>
            </div>
        </div>
    </section>

    <section class="listings-section" id="listings">
        <div class="section-header">
            <h2 class="section-title">Featured Contractors</h2>
            <a href="#" class="see-all">See all listings →</a>
        </div>
        <div class="listings-grid" id="listingsGrid">
            <!-- Loaded via JS -->
        </div>
    </section>

    <section class="cta-section">
        <h2>Need a Contractor?</h2>
        <p>Get matched with trusted professionals in your area. It's free!</p>
        <a href="#" class="btn-cta" onclick="openLeadModal()">Get a Free Quote</a>
    </section>

    <footer>
        <p>© 2026 MichiganContractors.com — Connecting homeowners with trusted professionals</p>
    </footer>

    <!-- Lead Modal -->
    <div class="modal-overlay" id="leadModal">
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Get a Free Quote</h3>
                <button class="modal-close" onclick="closeLeadModal()">×</button>
            </div>
            <form class="lead-form" onsubmit="submitLead(event)">
                <input type="text" id="leadName" placeholder="Your Name" required>
                <input type="tel" id="leadPhone" placeholder="Phone Number" required>
                <input type="email" id="leadEmail" placeholder="Email (optional)">
                <select id="leadCategory" required>
                    <option value="">Select Service Needed</option>
                    <option value="plumber">Plumbing</option>
                    <option value="electrician">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="roofer">Roofing</option>
                    <option value="landscaper">Landscaping</option>
                    <option value="painter">Painting</option>
                    <option value="carpenter">Carpentry</option>
                    <option value="cleaner">Cleaning</option>
                    <option value="other">Other</option>
                </select>
                <input type="text" id="leadZip" placeholder="Zip Code">
                <textarea id="leadDesc" placeholder="Describe what you need..."></textarea>
                <button type="submit" class="btn-submit">Submit Request</button>
            </form>
        </div>
    </div>

    <script>
        let allContractors = [];
        let userLat = null;
        let userLng = null;
        
        function getUserLocation() {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser');
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLat = position.coords.latitude;
                    userLng = position.coords.longitude;
                    alert('Location found! ' + userLat.toFixed(4) + ', ' + userLng.toFixed(4) + '. Search will find contractors near you.');
                    searchContractors();
                },
                (error) => {
                    let msg = 'Unable to get location: ';
                    if (error.code === 1) msg += 'Permission denied. Please allow location access.';
                    else if (error.code === 2) msg += 'Position unavailable.';
                    else if (error.code === 3) msg += 'Timeout. Please try again.';
                    alert(msg);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
        
        function calculateDistance(lat1, lon1, lat2, lon2) {
            // Simple distance in miles
            const R = 3959;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }
        
        async function loadContractors() {
            const grid = document.getElementById('listingsGrid');
            grid.innerHTML = '<p class="loading">Loading contractors...</p>';
            
            try {
                const resp = await fetch('/api/contractors?limit=50');
                const result = await resp.json();
                allContractors = result.data || [];
                displayContractors(allContractors);
            } catch (e) {
                grid.innerHTML = '<p class="error-message">Failed to load contractors</p>';
            }
        }
        
        function displayContractors(contractors) {
            const grid = document.getElementById('listingsGrid');
            if (!contractors.length) {
                grid.innerHTML = '<p class="no-results">No contractors found</p>';
                return;
            }
            
            grid.innerHTML = contractors.slice(0, 12).map(c => \`
                <div class="listing-card">
                    <div class="listing-header">
                        <div class="listing-category">\${c.category || 'Service'}</div>
                        <div class="listing-name">\${c.name}</div>
                    </div>
                    <div class="listing-body">
                        <div class="listing-rating">
                            <span class="stars">★</span>
                            <span class="rating-value">\${c.rating || '4.5'}</span>
                            <span class="review-count">(\${c.review_count || 0} reviews)</span>
                        </div>
                        <div class="listing-info">
                            <div class="info-row">
                                <span class="info-icon">📍</span>
                                <span>\${c.address || ''}, \${c.city || ''}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-icon">📞</span>
                                <span>\${c.phone || ''}</span>
                            </div>
                        </div>
                        <button class="btn-contact" onclick="openLeadModal()">Request Quote</button>
                    </div>
                </div>
            \`).join('');
        }
        
        async function searchContractors() {
            const category = document.getElementById('categoryInput').value;
            const city = document.getElementById('cityInput').value;
            
            let url = '/api/contractors?limit=100';
            if (category) url += '&category=' + category;
            
            try {
                const resp = await fetch(url);
                const result = await resp.json();
                let filtered = result.data || [];
                
                // Filter by city if entered
                if (city) {
                    filtered = filtered.filter(c => c.city && c.city.toLowerCase().includes(city.toLowerCase()));
                }
                
                // Filter by location if user provided location
                if (userLat && userLng) {
                    filtered = filtered.filter(c => {
                        if (!c.latitude || !c.longitude) return false;
                        const dist = calculateDistance(userLat, userLng, c.latitude, c.longitude);
                        c.distance = dist;
                        return dist <= 25; // 25 mile radius
                    }).sort((a, b) => a.distance - b.distance);
                }
                
                displayContractors(filtered);
            } catch (e) {
                console.error(e);
            }
        }
        
        function filterCategory(cat) {
            document.getElementById('categoryInput').value = cat;
            searchContractors();
            document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
        }
        
        function openLeadModal() {
            document.getElementById('leadModal').classList.add('active');
        }
        
        function closeLeadModal() {
            document.getElementById('leadModal').classList.remove('active');
        }
        
        async function submitLead(e) {
            e.preventDefault();
            
            const name = document.getElementById('leadName').value;
            const phone = document.getElementById('leadPhone').value;
            const email = document.getElementById('leadEmail').value;
            const category = document.getElementById('leadCategory').value;
            const zip = document.getElementById('leadZip').value;
            const desc = document.getElementById('leadDesc').value;
            
            if (!name || !phone || !category) {
                alert('Please fill in required fields');
                return;
            }
            
            try {
                const resp = await fetch('https://bvoaijksstjzseiywylf.supabase.co/rest/v1/leads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2b2Fpamtzc3RqenNlaXl3eWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0Njc3NjksImV4cCI6MjA5MDA0Mzc2OX0.vtM9V0knv9rwbFE4PkRHAtCW5puIXVHHaU8K8ddoANk',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2b2Fpamtzc3RqenNlaXl3eWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0Njc3NjksImV4cCI6MjA5MDA0Mzc2OX0.vtM9V0knv9rwbFE4PkRHAtCW5puIXVHHaU8K8ddoANk'
                    },
                    body: JSON.stringify({
                        name: name,
                        phone: phone,
                        email: email,
                        category: category,
                        zip_code: zip,
                        description: desc,
                        status: 'new'
                    })
                });
                
                if (resp.ok) {
                    document.getElementById('leadName').value = '';
                    document.getElementById('leadPhone').value = '';
                    document.getElementById('leadEmail').value = '';
                    document.getElementById('leadCategory').value = '';
                    document.getElementById('leadZip').value = '';
                    document.getElementById('leadDesc').value = '';
                    
                    alert('✅ Thanks! We\'ll connect you with contractors in your area soon.');
                } else {
                    alert('Something went wrong. Please try again.');
                }
            } catch (err) {
                console.error(err);
                alert('Error submitting. Please try again.');
            }
            
            closeLeadModal();
        }
        
        // Load on page load
        loadContractors();
    </script>
</body>
</html>
`;
  return new Response(pageContent, {
    headers: { 'Content-Type': 'text/html' }
  });
}