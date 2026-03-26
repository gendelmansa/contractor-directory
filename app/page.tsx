// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function page(): any {
  const pageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Michigan Contractors | Find Trusted Home Service Pros</title>
    <meta name="description" content="Find the best plumbers, electricians, HVAC, roofers and more in Michigan.">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5186873318610186"
     crossorigin="anonymous"></script>
    <style>
        :root { --primary: #0f172a; --primary-light: #1e293b; --accent: #3b82f6; --accent-hover: #2563eb; --warning: #f59e0b; --gray-50: #f8fafc; --gray-100: #f1f5f9; --gray-200: #e2e8f0; --gray-500: #64748b; --gray-600: #475569; --gray-700: #334155; --gray-800: #1e293b; --gray-900: #0f172a; --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1); --radius: 12px; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: var(--gray-50); color: var(--gray-800); line-height: 1.6; }
        nav { background: white; border-bottom: 1px solid var(--gray-200); position: sticky; top: 0; z-index: 100; }
        .nav-inner { max-width: 1400px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 0.5rem; }
        .logo-icon { width: 40px; height: 40px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; }
        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a { color: var(--gray-600); text-decoration: none; font-weight: 500; }
        .btn-nav { background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 500; }
        .hero { background: linear-gradient(135deg, var(--primary), var(--primary-light)); padding: 4rem 2rem; text-align: center; color: white; }
        .hero h1 { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; }
        .hero p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
        .hero-stats { display: flex; justify-content: center; gap: 3rem; margin-top: 2rem; }
        .stat-number { font-size: 2rem; font-weight: 700; }
        .stat-label { font-size: 0.875rem; opacity: 0.8; }
        .search-container { max-width: 900px; margin: -3rem auto 2rem; position: relative; z-index: 10; padding: 0 1rem; }
        .ad-container { text-align: center; margin: 1.5rem auto; max-width: 100%; overflow: hidden; }
        .ad-container.inset { max-width: 728px; }
        .search-box { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-lg); }
        .search-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; }
        .form-group label { font-weight: 600; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--gray-700); }
        .form-group input, .form-group select { padding: 0.875rem; border: 2px solid var(--gray-200); border-radius: 10px; font-size: 1rem; width: 100%; }
        .btn-search { background: var(--accent); color: white; padding: 0.875rem 2rem; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .categories-section { max-width: 1400px; margin: 3rem auto; padding: 0 2rem; }
        .section-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
        .categories-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
        .category-card { background: white; border-radius: var(--radius); padding: 1.5rem; text-align: center; border: 2px solid transparent; cursor: pointer; box-shadow: var(--shadow); }
        .category-card:hover { border-color: var(--accent); transform: translateY(-2px); }
        .category-icon { width: 60px; height: 60px; background: var(--gray-100); border-radius: 12px; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; }
        .category-name { font-weight: 600; }
        .category-count { font-size: 0.875rem; color: var(--gray-500); }
        .listings-section { max-width: 1400px; margin: 3rem auto; padding: 0 2rem; }
        .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .listing-card { background: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
        .listing-card:hover { transform: translateY(-4px); }
        .listing-header { background: linear-gradient(135deg, var(--accent), var(--accent-hover)); padding: 1.25rem; color: white; }
        .listing-category { font-size: 0.75rem; text-transform: uppercase; }
        .listing-name { font-size: 1.25rem; font-weight: 700; margin-top: 0.25rem; }
        .listing-body { padding: 1.25rem; }
        .stars { color: var(--warning); }
        .review-count { color: var(--gray-500); font-size: 0.875rem; }
        .info-row { display: flex; gap: 0.5rem; font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem; }
        .btn-contact { display: block; width: 100%; background: var(--gray-100); padding: 0.875rem; border: none; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        .cta-section { background: var(--primary); padding: 4rem 2rem; text-align: center; color: white; margin-top: 4rem; }
        .btn-cta { background: var(--accent); color: white; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; text-decoration: none; }
        footer { background: var(--gray-900); color: var(--gray-500); padding: 3rem 2rem; text-align: center; }
        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; }
        .modal-overlay.active { display: flex; }
        .modal { background: white; border-radius: 16px; padding: 2rem; max-width: 500px; margin: auto; }
        .modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
        .modal-title { font-size: 1.5rem; font-weight: 700; }
        .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
        .lead-form { display: flex; flex-direction: column; gap: 1rem; }
        .lead-form input, .lead-form select, .lead-form textarea { padding: 0.875rem; border: 2px solid var(--gray-200); border-radius: 8px; }
        .btn-submit { background: var(--accent); color: white; padding: 1rem; border: none; border-radius: 8px; font-weight: 600; }
        @media (max-width: 768px) { .search-grid { grid-template-columns: 1fr; } .categories-grid { grid-template-columns: repeat(2, 1fr); } .hero h1 { font-size: 2rem; } }
    </style>
</head>
<body>
    <nav><div class="nav-inner"><div class="logo"><div class="logo-icon">🏠</div>MichiganContractors</div><div class="nav-links"><a href="/">Home</a><a href="#categories">Categories</a><a href="#listings">Featured</a><a href="#" class="btn-nav" onclick="openLeadModal()">Get Quote</a></div></div></nav>
    <section class="hero"><h1>Find Trusted Contractors<br>Across Michigan</h1><p>Connect with verified plumbers, electricians, HVAC pros, and more</p><div class="hero-stats"><div class="stat"><div class="stat-number">130+</div><div class="stat-label">Verified Contractors</div></div><div class="stat"><div class="stat-number">30+</div><div class="stat-label">Cities</div></div><div class="stat"><div class="stat-number">8</div><div class="stat-label">Services</div></div></div></section>
    <div class="ad-container">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="ca-pub-5186873318610186"
             data-ad-slot="1234567890"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
    </div>
    <div class="search-container"><div class="search-box"><div class="search-grid"><div class="form-group"><label>Service Type</label><select id="categoryInput"><option value="">All Services</option><option value="plumber">Plumbers</option><option value="electrician">Electricians</option><option value="hvac">HVAC</option><option value="roofer">Roofers</option><option value="landscaper">Landscapers</option><option value="painter">Painters</option><option value="carpenter">Carpenters</option><option value="cleaner">Cleaners</option></select></div><div class="form-group"><label>City</label><input type="text" id="cityInput" placeholder="e.g. Detroit"></div><button class="btn-search" onclick="searchContractors()">Search</button></div></div></div>
    <section class="categories-section" id="categories"><h2 class="section-title">Browse by Service</h2><div class="categories-grid"><div class="category-card" onclick="filterCategory('plumber')"><div class="category-icon">🔧</div><div class="category-name">Plumbing</div><div class="category-count">30+ pros</div></div><div class="category-card" onclick="filterCategory('electrician')"><div class="category-icon">⚡</div><div class="category-name">Electrical</div><div class="category-count">25+ pros</div></div><div class="category-card" onclick="filterCategory('hvac')"><div class="category-icon">❄️</div><div class="category-name">HVAC</div><div class="category-count">20+ pros</div></div><div class="category-card" onclick="filterCategory('roofer')"><div class="category-icon">🏗️</div><div class="category-name">Roofing</div><div class="category-count">15+ pros</div></div></div></section>
    <section class="listings-section" id="listings"><h2 class="section-title">Featured Contractors</h2><div class="listings-grid" id="listingsGrid"><p style="text-align:center;padding:2rem;">Loading contractors...</p></div></section>
    <section class="cta-section"><h2>Need a Contractor?</h2><p>Get matched with trusted professionals. It's free!</p><a href="#" class="btn-cta" onclick="openLeadModal()">Get a Free Quote</a></section>
    <footer><p>© 2026 MichiganContractors.com</p></footer>
    <div class="modal-overlay" id="leadModal"><div class="modal"><div class="modal-header"><h3 class="modal-title">Get a Free Quote</h3><button class="modal-close" onclick="closeLeadModal()">×</button></div><form class="lead-form" onsubmit="submitLead(event)"><input type="text" id="leadName" placeholder="Your Name" required><input type="tel" id="leadPhone" placeholder="Phone Number" required><input type="email" id="leadEmail" placeholder="Email (optional)"><select id="leadCategory" required><option value="">Select Service</option><option value="plumber">Plumbing</option><option value="electrician">Electrical</option><option value="hvac">HVAC</option><option value="roofer">Roofing</option><option value="landscaper">Landscaping</option><option value="painter">Painting</option><option value="carpenter">Carpentry</option><option value="cleaner">Cleaning</option></select><input type="text" id="leadZip" placeholder="Zip Code"><textarea id="leadDesc" placeholder="Describe what you need..."></textarea><button type="submit" class="btn-submit">Submit Request</button></form></div></div>
    <script>
        let allContractors = [];
        async function loadContractors() {
            try { const resp = await fetch('/api/contractors?limit=50'); const result = await resp.json(); allContractors = result.data || []; displayContractors(allContractors); } catch(e) { document.getElementById('listingsGrid').innerHTML = '<p style="text-align:center;color:red;">Failed to load</p>'; }
        }
        function displayContractors(contractors) {
            const grid = document.getElementById('listingsGrid');
            if (!contractors.length) { grid.innerHTML = '<p style="text-align:center;">No contractors found</p>'; return; }
            grid.innerHTML = contractors.slice(0,12).map(c => '<div class="listing-card"><div class="listing-header"><div class="listing-category">'+(c.category||'Service')+'</div><div class="listing-name">'+(c.name||'')+'</div></div><div class="listing-body"><div><span class="stars">★</span> '+(c.rating||'4.5')+' <span class="review-count">('+(c.review_count||0)+' reviews)</span></div><div class="info-row"><span>📍</span> '+(c.address||'')+', '+(c.city||'')+'</div><div class="info-row"><span>📞</span> '+(c.phone||'')+'</div><button class="btn-contact" onclick="openLeadModal()">Request Quote</button></div></div>').join('');
        }
        async function searchContractors() {
            const cat = document.getElementById('categoryInput').value;
            const city = document.getElementById('cityInput').value;
            let url = '/api/contractors?limit=100';
            if (cat) url += '&category=' + cat;
            try { const resp = await fetch(url); const result = await resp.json(); let filtered = result.data || []; if (city) filtered = filtered.filter(c => c.city && c.city.toLowerCase().includes(city.toLowerCase())); displayContractors(filtered); } catch(e) { console.error(e); }
        }
        function filterCategory(cat) { document.getElementById('categoryInput').value = cat; searchContractors(); document.getElementById('listings').scrollIntoView({ behavior: 'smooth' }); }
        function openLeadModal() { document.getElementById('leadModal').classList.add('active'); }
        function closeLeadModal() { document.getElementById('leadModal').classList.remove('active'); }
        async function submitLead(e) {
            e.preventDefault();
            const data = { name: document.getElementById('leadName').value, phone: document.getElementById('leadPhone').value, email: document.getElementById('leadEmail').value, category: document.getElementById('leadCategory').value, zip_code: document.getElementById('leadZip').value, description: document.getElementById('leadDesc').value };
            if (!data.name || !data.phone || !data.category) { alert('Please fill required fields'); return; }
            try {
                const resp = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                if (resp.ok) { ['leadName','leadPhone','leadEmail','leadCategory','leadZip','leadDesc'].forEach(id => document.getElementById(id).value = ''); alert('✅ Thanks! We\'ll connect you with contractors soon.'); }
                else { alert('Something went wrong'); }
            } catch(err) { alert('Error submitting'); }
            closeLeadModal();
        }
        loadContractors();
        try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) { console.log('AdSense init error:', e); }
    </script>
</body>
</html>`;

  // Return as inline HTML response
  return pageContent;
}