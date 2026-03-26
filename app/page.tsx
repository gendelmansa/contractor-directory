'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Contractor {
  id: number;
  name: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  rating: number;
  review_count: number;
  phone: string;
}

export default function Home() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadContractors();
  }, []);

  useEffect(() => {
    // AdSense init after adsbygoogle script loads
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (e) {
        console.log('AdSense init error:', e);
      }
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

  async function searchContractors(category: string, city: string) {
    let url = '/api/contractors?limit=100';
    if (category) url += `&category=${category}`;
    try {
      const resp = await fetch(url);
      const result = await resp.json();
      let filtered = result.data || [];
      if (city) {
        filtered = filtered.filter((c: Contractor) => 
          c.city && c.city.toLowerCase().includes(city.toLowerCase())
        );
      }
      setContractors(filtered);
    } catch (e) {
      console.error(e);
    }
  }

  function filterCategory(cat: string) {
    const cityInput = (document.getElementById('cityInput') as HTMLInputElement)?.value || '';
    searchContractors(cat, cityInput);
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
    } catch (err) {
      alert('Error submitting');
    }
    setModalOpen(false);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Michigan Contractors Directory',
            description: 'Find trusted plumbers, electricians, HVAC pros, roofers & more in Michigan.',
            url: 'https://michigan-contractors.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://michigan-contractors.com?search={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5186873318610186"
        crossOrigin="anonymous"
      />
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --primary: #0f172a; --primary-light: #1e293b; --accent: #3b82f6; --accent-hover: #2563eb; --warning: #f59e0b; --gray-50: #f8fafc; --gray-100: #f1f5f9; --gray-200: #e2e8f0; --gray-500: #64748b; --gray-600: #475569; --gray-700: #334155; --gray-800: #1e293b; --gray-900: #0f172a; --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1); --radius: 12px; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: var(--gray-50); color: var(--gray-800); line-height: 1.6; }
        nav { background: white; border-bottom: 1px solid var(--gray-200); position: sticky; top: 0; z-index: 100; }
        .nav-inner { max-width: 1400px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 0.5rem; }
        .logo-icon { width: 40px; height: 40px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; }
        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a { color: var(--gray-600); text-decoration: none; font-weight: 500; }
        .btn-nav { background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 500; border: none; cursor: pointer; font-size: 1rem; }
        .hero { background: linear-gradient(135deg, var(--primary), var(--primary-light)); padding: 4rem 2rem; text-align: center; color: white; }
        .hero h1 { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; }
        .hero p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
        .hero-stats { display: flex; justify-content: center; gap: 3rem; margin-top: 2rem; }
        .stat-number { font-size: 2rem; font-weight: 700; }
        .stat-label { font-size: 0.875rem; opacity: 0.8; }
        .search-container { max-width: 900px; margin: -3rem auto 2rem; position: relative; z-index: 10; padding: 0 1rem; }
        .ad-container { text-align: center; margin: 1.5rem auto; max-width: 100%; overflow: hidden; }
        .search-box { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-lg); }
        .search-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; }
        .form-group label { font-weight: 600; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--gray-700); display: block; }
        .form-group input, .form-group select { padding: 0.875rem; border: 2px solid var(--gray-200); border-radius: 10px; font-size: 1rem; width: 100%; }
        .btn-search { background: var(--accent); color: white; padding: 0.875rem 2rem; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .categories-section { max-width: 1400px; margin: 3rem auto; padding: 0 2rem; }
        .section-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
        .categories-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
        .category-card { background: white; border-radius: var(--radius); padding: 1.5rem; text-align: center; border: 2px solid transparent; cursor: pointer; box-shadow: var(--shadow); transition: all 0.2s; }
        .category-card:hover { border-color: var(--accent); transform: translateY(-2px); }
        .category-icon { width: 60px; height: 60px; background: var(--gray-100); border-radius: 12px; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; }
        .category-name { font-weight: 600; }
        .category-count { font-size: 0.875rem; color: var(--gray-500); }
        .listings-section { max-width: 1400px; margin: 3rem auto; padding: 0 2rem; }
        .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .listing-card { background: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); transition: transform 0.2s; }
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
        .btn-cta { background: var(--accent); color: white; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; text-decoration: none; display: inline-block; border: none; cursor: pointer; font-size: 1rem; }
        footer { background: var(--gray-900); color: var(--gray-500); padding: 3rem 2rem; text-align: center; }
        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; }
        .modal-overlay.active { display: flex; align-items: center; justify-content: center; }
        .modal { background: white; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; }
        .modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
        .modal-title { font-size: 1.5rem; font-weight: 700; }
        .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
        .lead-form { display: flex; flex-direction: column; gap: 1rem; }
        .lead-form input, .lead-form select, .lead-form textarea { padding: 0.875rem; border: 2px solid var(--gray-200); border-radius: 8px; }
        .btn-submit { background: var(--accent); color: white; padding: 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        @media (max-width: 768px) { .search-grid { grid-template-columns: 1fr; } .categories-grid { grid-template-columns: repeat(2, 1fr); } .hero h1 { font-size: 2rem; } }
      ` }} />

      <nav>
        <div className="nav-inner">
          <div className="logo">
            <div className="logo-icon">🏠</div>
            MichiganContractors
          </div>
          <div className="nav-links">
            <a href="/">Home</a>
            <a href="#categories">Categories</a>
            <a href="#listings">Featured</a>
            <button className="btn-nav" onClick={() => setModalOpen(true)}>Get Quote</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <h1>Find Trusted Contractors<br />Across Michigan</h1>
        <p>Connect with verified plumbers, electricians, HVAC pros, and more</p>
        <div className="hero-stats">
          <div><div className="stat-number">130+</div><div className="stat-label">Verified Contractors</div></div>
          <div><div className="stat-number">30+</div><div className="stat-label">Cities</div></div>
          <div><div className="stat-number">8</div><div className="stat-label">Services</div></div>
        </div>
      </section>

      <div className="ad-container">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-5186873318610186"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      <div className="search-container">
        <div className="search-box">
          <div className="search-grid">
            <div className="form-group">
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
            <div className="form-group">
              <label>City</label>
              <input type="text" id="cityInput" placeholder="e.g. Detroit" />
            </div>
            <button className="btn-search" onClick={() => {
              const cat = (document.getElementById('categoryInput') as HTMLSelectElement).value;
              const city = (document.getElementById('cityInput') as HTMLInputElement).value;
              searchContractors(cat, city);
            }}>Search</button>
          </div>
        </div>
      </div>

      <section className="categories-section" id="categories">
        <h2 className="section-title">Browse by Service</h2>
        <div className="categories-grid">
          <div className="category-card" onClick={() => filterCategory('plumber')}>
            <div className="category-icon">🔧</div>
            <div className="category-name">Plumbing</div>
            <div className="category-count">30+ pros</div>
          </div>
          <div className="category-card" onClick={() => filterCategory('electrician')}>
            <div className="category-icon">⚡</div>
            <div className="category-name">Electrical</div>
            <div className="category-count">25+ pros</div>
          </div>
          <div className="category-card" onClick={() => filterCategory('hvac')}>
            <div className="category-icon">❄️</div>
            <div className="category-name">HVAC</div>
            <div className="category-count">20+ pros</div>
          </div>
          <div className="category-card" onClick={() => filterCategory('roofer')}>
            <div className="category-icon">🏗️</div>
            <div className="category-name">Roofing</div>
            <div className="category-count">15+ pros</div>
          </div>
        </div>
      </section>

      <section className="listings-section" id="listings">
        <h2 className="section-title">Featured Contractors</h2>
        <div className="listings-grid">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading contractors...</p>
          ) : contractors.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No contractors found</p>
          ) : (
            contractors.slice(0, 12).map((c) => (
              <div className="listing-card" key={c.id}>
                <div className="listing-header">
                  <div className="listing-category">{c.category || 'Service'}</div>
                  <div className="listing-name">{c.name}</div>
                </div>
                <div className="listing-body">
                  <div>
                    <span className="stars">★</span> {c.rating || 4.5}{' '}
                    <span className="review-count">({c.review_count || 0} reviews)</span>
                  </div>
                  <div className="info-row">
                    <span>📍</span> {c.address}, {c.city}
                  </div>
                  <div className="info-row">
                    <span>📞</span> {c.phone}
                  </div>
                  <button className="btn-contact" onClick={() => setModalOpen(true)}>
                    Request Quote
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="cta-section">
        <h2>Need a Contractor?</h2>
        <p>Get matched with trusted professionals. It's free!</p>
        <button className="btn-cta" onClick={() => setModalOpen(true)}>Get a Free Quote</button>
      </section>

      <footer>
        <p>© 2026 MichiganContractors.com</p>
      </footer>

      <div className={`modal-overlay ${modalOpen ? 'active' : ''}`} onClick={() => setModalOpen(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Get a Free Quote</h3>
            <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
          </div>
          <form className="lead-form" onSubmit={submitLead}>
            <input name="leadName" type="text" placeholder="Your Name" required />
            <input name="leadPhone" type="tel" placeholder="Phone Number" required />
            <input name="leadEmail" type="email" placeholder="Email (optional)" />
            <select name="leadCategory" required>
              <option value="">Select Service</option>
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