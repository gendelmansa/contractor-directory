'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

interface Contractor {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  rating: number;
  review_count: number;
  phone: string;
  logo: string | null;
}

export default function Home() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    loadContractors();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) window.adsbygoogle.push({});
      } catch (e) {}
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  async function loadContractors() {
    try {
      const resp = await fetch('/api/contractors?limit=50');
      const result = await resp.json();
      setContractors(result.data || []);
    } catch (e) {
      console.error('Failed to load contractors:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    let url = '/api/contractors?limit=100';
    if (searchCategory) url += `&category=${searchCategory}`;
    try {
      const resp = await fetch(url);
      const result = await resp.json();
      let filtered = result.data || [];
      if (searchCity) {
        filtered = filtered.filter((c: Contractor) => 
          c.city?.toLowerCase().includes(searchCity.toLowerCase())
        );
      }
      setContractors(filtered);
    } catch (e) { console.error(e); }
  }

  function filterCategory(cat: string) {
    setSearchCategory(cat);
    handleSearch();
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function submitLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('leadName') as HTMLInputElement).value,
      phone: (form.elements.namedItem('leadPhone') as HTMLInputElement).value,
      email: (form.elements.namedItem('leadEmail') as HTMLInputElement).value,
      category: (form.elements.namedItem('leadCategory') as HTMLSelectElement).value,
      zip_code: (form.elements.namedItem('leadZip') as HTMLInputElement).value,
      description: (form.elements.namedItem('leadDesc') as HTMLTextAreaElement).value,
    };
    if (!data.name || !data.phone || !data.category) {
      alert('Please fill required fields');
      return;
    }
    try {
      const resp = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (resp.ok) {
        form.reset();
        alert('✅ Thanks! We\'ll connect you with contractors soon.');
      } else {
        alert('Something went wrong');
      }
    } catch (err) { alert('Error submitting'); }
    setModalOpen(false);
  }

  const categoryIcons: Record<string, string> = {
    plumber: '🔧', electrician: '⚡', hvac: '❄️', roofer: '🏗️',
    landscaper: '🌳', painter: '🎨', carpenter: '🪚', cleaner: '🧹'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Michigan Contractors Directory',
            url: 'https://michigan-contractors.com',
            potentialAction: { '@type': 'SearchAction', target: 'https://michigan-contractors.com?search={search_term_string}', 'query-input': 'required name=search_term_string' }
          })
        }}
      />
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5186873318610186" crossOrigin="anonymous" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        :root { 
          --primary: #0D5C63; --primary-dark: #094147; --accent: #00A896; --accent-light: #02C4AC;
          --warning: #F5A623; --success: #2ECC71; --white: #ffffff; --gray-50: #F9FAFB;
          --gray-100: #F3F4F6; --gray-200: #E5E7EB; --gray-300: #D1D5DB; --gray-400: #9CA3AF;
          --gray-500: #6B7280; --gray-600: #4B5563; --gray-700: #374151; --gray-800: #1F2937;
          --shadow-sm: 0 1px 2px rgba(0,0,0,0.05); --shadow: 0 1px 3px rgba(0,0,0,0.1); --shadow-md: 0 4px 6px rgba(0,0,0,0.1); --shadow-lg: 0 10px 15px rgba(0,0,0,0.1); --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
          --radius-sm: 4px; --radius: 8px; --radius-lg: 12px; --radius-xl: 16px;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--gray-50); color: var(--gray-800); line-height: 1.6; -webkit-font-smoothing: antialiased; }
        
        /* Header */
        .header { background: var(--white); border-bottom: 1px solid var(--gray-200); position: sticky; top: 0; z-index: 100; }
        .header-inner { max-width: 1280px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
        .logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
        .logo-text { font-size: 1.35rem; font-weight: 700; color: var(--primary-dark); }
        .logo-text span { color: var(--accent); }
        .header-nav { display: flex; gap: 2rem; align-items: center; }
        .header-nav a { color: var(--gray-600); text-decoration: none; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
        .header-nav a:hover { color: var(--primary); }
        .btn-primary { background: var(--primary); color: var(--white); padding: 0.65rem 1.25rem; border-radius: var(--radius); font-weight: 600; text-decoration: none; font-size: 0.9rem; transition: all 0.2s; border: none; cursor: pointer; }
        .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }
        
        /* Hero */
        .hero { background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--accent) 100%); padding: 4.5rem 2rem 5rem; text-align: center; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); opacity: 0.5; }
        .hero h1 { font-size: 3rem; font-weight: 800; color: var(--white); margin-bottom: 1rem; position: relative; }
        .hero p { font-size: 1.25rem; color: rgba(255,255,255,0.9); margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; position: relative; }
        .hero-stats { display: flex; justify-content: center; gap: 3.5rem; margin-top: 2.5rem; position: relative; }
        .hero-stats .stat { text-align: center; }
        .hero-stats .stat-number { font-size: 2.25rem; font-weight: 800; color: var(--white); }
        .hero-stats .stat-label { font-size: 0.9rem; color: rgba(255,255,255,0.8); }
        
        /* Search Box */
        .search-container { max-width: 900px; margin: -4rem auto 2rem; position: relative; z-index: 10; padding: 0 1rem; }
        .search-box { background: var(--white); border-radius: var(--radius-xl); padding: 1.5rem; box-shadow: var(--shadow-xl); }
        .search-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: end; }
        .form-group { text-align: left; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--gray-700); }
        .form-group input, .form-group select { padding: 0.875rem 1rem; border: 2px solid var(--gray-200); border-radius: var(--radius); font-size: 1rem; width: 100%; transition: all 0.2s; background: var(--gray-50); }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--accent); background: var(--white); box-shadow: 0 0 0 3px rgba(0,168,150,0.15); }
        .btn-search { background: var(--accent); color: var(--white); padding: 1rem 2.5rem; border: none; border-radius: var(--radius); font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
        .btn-search:hover { background: var(--accent-light); transform: translateY(-1px); box-shadow: var(--shadow-md); }
        
        /* Ad */
        .ad-container { text-align: center; padding: 1rem; max-width: 100%; margin: 0 auto; }
        
        /* Categories */
        .categories-section { max-width: 1280px; margin: 3rem auto; padding: 0 2rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .section-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-800); }
        .view-all { color: var(--accent); text-decoration: none; font-weight: 600; font-size: 0.95rem; }
        .categories-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 1rem; }
        .category-card { background: var(--white); border-radius: var(--radius-lg); padding: 1.25rem; text-align: center; border: 2px solid transparent; cursor: pointer; box-shadow: var(--shadow-sm); transition: all 0.25s; }
        .category-card:hover { border-color: var(--accent); transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .category-icon { width: 56px; height: 56px; background: linear-gradient(135deg, var(--gray-100), var(--gray-200)); border-radius: var(--radius); margin: 0 auto 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .category-name { font-weight: 600; font-size: 0.9rem; color: var(--gray-700); }
        .category-count { font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem; }
        
        /* Listings */
        .listings-section { max-width: 1280px; margin: 2rem auto 4rem; padding: 0 2rem; }
        .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .listing-card { background: var(--white); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); transition: all 0.25s; border: 1px solid var(--gray-200); display: block; text-decoration: none; color: inherit; }
        .listing-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--accent); }
        .listing-header { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); padding: 1.25rem; color: var(--white); display: flex; align-items: center; gap: 0.75rem; }
        .listing-logo { width: 48px; height: 48px; background: var(--white); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
        .listing-logo img { width: 100%; height: 100%; object-fit: cover; }
        .listing-logo-icon { font-size: 1.25rem; }
        .listing-header-text { min-width: 0; }
        .listing-category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
        .listing-name { font-size: 1.1rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .listing-body { padding: 1.25rem; }
        .listing-rating { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
        .stars { color: var(--warning); letter-spacing: 2px; }
        .rating-value { font-weight: 700; color: var(--gray-800); }
        .review-count { color: var(--gray-500); font-size: 0.85rem; }
        .listing-location { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--gray-600); margin-bottom: 0.5rem; }
        .listing-phone { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--gray-600); }
        .btn-contact { width: 100%; background: var(--gray-100); padding: 0.875rem; border: none; font-weight: 600; cursor: pointer; margin-top: 0.75rem; border-radius: var(--radius); transition: all 0.2s; color: var(--gray-700); font-size: 0.95rem; }
        .btn-contact:hover { background: var(--accent); color: var(--white); }
        
        /* CTA */
        .cta-section { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); padding: 4rem 2rem; text-align: center; color: var(--white); }
        .cta-section h2 { font-size: 2rem; font-weight: 700; margin-bottom: 0.75rem; }
        .cta-section p { font-size: 1.1rem; opacity: 0.9; margin-bottom: 1.5rem; }
        .btn-cta { background: var(--accent); color: var(--white); padding: 1rem 2rem; border-radius: var(--radius); font-weight: 600; text-decoration: none; display: inline-block; border: none; cursor: pointer; font-size: 1rem; transition: all 0.2s; }
        .btn-cta:hover { background: var(--accent-light); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        
        /* Footer */
        footer { background: var(--gray-900); color: var(--gray-400); padding: 2rem; text-align: center; font-size: 0.9rem; }
        footer a { color: var(--gray-300); text-decoration: none; }
        
        /* Modal */
        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .modal-overlay.active { display: flex; }
        .modal { background: var(--white); border-radius: var(--radius-xl); padding: 2rem; max-width: 480px; width: 90%; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-800); }
        .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray-500); padding: 0.25rem; }
        .modal-close:hover { color: var(--gray-700); }
        .lead-form { display: flex; flex-direction: column; gap: 1rem; }
        .lead-form input, .lead-form select, .lead-form textarea { padding: 0.875rem; border: 2px solid var(--gray-200); border-radius: var(--radius); font-size: 1rem; transition: all 0.2s; }
        .lead-form input:focus, .lead-form select:focus, .lead-form textarea:focus { outline: none; border-color: var(--accent); }
        .lead-form textarea { min-height: 100px; resize: vertical; }
        .btn-submit { background: var(--accent); color: var(--white); padding: 1rem; border: none; border-radius: var(--radius); font-weight: 600; cursor: pointer; font-size: 1rem; transition: all 0.2s; }
        .btn-submit:hover { background: var(--accent-light); }
        
        /* Responsive */
        @media (max-width: 1024px) { .categories-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 768px) { 
          .hero h1 { font-size: 2rem; }
          .hero-stats { gap: 2rem; }
          .search-grid { grid-template-columns: 1fr; }
          .header-nav { display: none; }
          .categories-grid { grid-template-columns: repeat(2, 1fr); }
          .listing-header { flex-direction: column; align-items: flex-start; }
        }
      ` }} />

      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">🏠</div>
            <span className="logo-text">Michigan<span>Contractors</span></span>
          </Link>
          <nav className="header-nav">
            <a href="#categories">Categories</a>
            <a href="#listings">Featured</a>
            <button className="btn-primary" onClick={() => setModalOpen(true)}>Get Free Quote</button>
          </nav>
        </div>
      </header>

      <section className="hero">
        <h1>Find Trusted Contractors<br />Across Michigan</h1>
        <p>Connect with verified professionals for your home projects. Get free quotes from top-rated service providers.</p>
        <div className="hero-stats">
          <div className="stat"><div className="stat-number">130+</div><div className="stat-label">Verified Contractors</div></div>
          <div className="stat"><div className="stat-number">30+</div><div className="stat-label">Cities Covered</div></div>
          <div className="stat"><div className="stat-number">8</div><div className="stat-label">Service Types</div></div>
        </div>
      </section>

      <div className="search-container">
        <div className="search-box">
          <div className="search-grid">
            <div className="form-group">
              <label>Service Type</label>
              <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                <option value="">All Services</option>
                <option value="plumber">Plumbing</option>
                <option value="electrician">Electrical</option>
                <option value="hvac">HVAC</option>
                <option value="roofer">Roofing</option>
                <option value="landscaper">Landscaping</option>
                <option value="painter">Painting</option>
                <option value="carpenter">Carpentry</option>
                <option value="cleaner">Cleaning</option>
              </select>
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} placeholder="e.g. Detroit" />
            </div>
            <button className="btn-search" onClick={handleSearch}>Search</button>
          </div>
        </div>
      </div>

      <div className="ad-container">
        <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-5186873318610186" data-ad-slot="1234567890" data-ad-format="auto" data-full-width-responsive="true" />
      </div>

      <section className="categories-section" id="categories">
        <div className="section-header">
          <h2 className="section-title">Browse by Service</h2>
          <a href="#" className="view-all">View All →</a>
        </div>
        <div className="categories-grid">
          {[
            { cat: 'plumber', name: 'Plumbing', icon: '🔧', count: '30+' },
            { cat: 'electrician', name: 'Electrical', icon: '⚡', count: '25+' },
            { cat: 'hvac', name: 'HVAC', icon: '❄️', count: '20+' },
            { cat: 'roofer', name: 'Roofing', icon: '🏗️', count: '15+' },
            { cat: 'landscaper', name: 'Landscaping', icon: '🌳', count: '12+' },
            { cat: 'painter', name: 'Painting', icon: '🎨', count: '10+' },
            { cat: 'carpenter', name: 'Carpentry', icon: '🪚', count: '8+' },
            { cat: 'cleaner', name: 'Cleaning', icon: '🧹', count: '10+' },
          ].map(c => (
            <div className="category-card" key={c.cat} onClick={() => filterCategory(c.cat)}>
              <div className="category-icon">{c.icon}</div>
              <div className="category-name">{c.name}</div>
              <div className="category-count">{c.count} pros</div>
            </div>
          ))}
        </div>
      </section>

      <section className="listings-section" id="listings">
        <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Featured Contractors</h2>
        <div className="listings-grid">
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>Loading contractors...</p>
          ) : contractors.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>No contractors found. Try a different search.</p>
          ) : (
            contractors.slice(0, 12).map((c) => (
              <Link href={`/contractor/${c.id}`} className="listing-card" key={c.id}>
                <div className="listing-header">
                  <div className="listing-logo">
                    {c.logo ? <img src={c.logo} alt="" /> : <span className="listing-logo-icon">{categoryIcons[c.category] || '🏢'}</span>}
                  </div>
                  <div className="listing-header-text">
                    <div className="listing-category">{c.category || 'Service'}</div>
                    <div className="listing-name">{c.name}</div>
                  </div>
                </div>
                <div className="listing-body">
                  <div className="listing-rating">
                    <span className="stars">{'★'.repeat(Math.floor(c.rating || 4))}</span>
                    <span className="rating-value">{(c.rating || 4.5).toFixed(1)}</span>
                    <span className="review-count">({c.review_count || 0} reviews)</span>
                  </div>
                  <div className="listing-location">📍 {c.address}, {c.city}</div>
                  <div className="listing-phone">📞 {c.phone}</div>
                  <button className="btn-contact" onClick={(e) => { e.preventDefault(); setModalOpen(true); }}>Request Quote</button>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Tell us what you need and we'll match you with the right professionals.</p>
        <button className="btn-cta" onClick={() => setModalOpen(true)}>Get a Free Quote</button>
      </section>

      <footer>
        <p>© 2026 MichiganContractors.com — <a href="#">Privacy</a> · <a href="#">Terms</a></p>
      </footer>

      <div className={`modal-overlay ${modalOpen ? 'active' : ''}`} onClick={() => setModalOpen(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Get a Free Quote</h3>
            <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
          </div>
          <form className="lead-form" onSubmit={submitLead}>
            <input name="leadName" type="text" placeholder="Your Name *" required />
            <input name="leadPhone" type="tel" placeholder="Phone Number *" required />
            <input name="leadEmail" type="email" placeholder="Email (optional)" />
            <select name="leadCategory" required>
              <option value="">Select Service *</option>
              <option value="plumber">Plumbing</option>
              <option value="electrician">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="roofer">Roofing</option>
              <option value="landscaper">Landscaping</option>
              <option value="painter">Painting</option>
              <option value="carpenter">Carpentry</option>
              <option value="cleaner">Cleaning</option>
            </select>
            <input name="leadZip" type="text" placeholder="Zip Code" />
            <textarea name="leadDesc" placeholder="Describe what you need..."></textarea>
            <button type="submit" className="btn-submit">Submit Request</button>
          </form>
        </div>
      </div>
    </>
  );
}