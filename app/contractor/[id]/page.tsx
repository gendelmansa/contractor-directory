import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

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
  website: string | null;
}

interface Review {
  id: number;
  contractor_id: number;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
}

async function getContractor(id: string): Promise<Contractor | null> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.from('contractors').select('*').eq('id', id).single();
    if (error) {
      console.error('Error fetching contractor:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.error('Error loading contractor:', e);
    return null;
  }
}

async function getReviews(id: string): Promise<Review[]> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.from('reviews').select('*').eq('contractor_id', id).order('created_at', { ascending: false }).limit(10);
    return data || [];
  } catch (e) {
    console.error('Error loading reviews:', e);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const contractor = await getContractor(id);
  if (!contractor) return { title: 'Contractor Not Found' };
  return {
    title: `${contractor.name} | Michigan Contractors`,
    description: `${contractor.name} - ${contractor.category} in ${contractor.city}, Michigan. Rating: ${contractor.rating}/5`,
  };
}

export default async function ContractorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contractor = await getContractor(id);
  if (!contractor) notFound();
  const reviews = await getReviews(id);
  
  const categoryIcons: Record<string, string> = { plumber: '🔧', electrician: '⚡', hvac: '❄️', roofer: '🏗️', landscaper: '🌳', painter: '🎨', carpenter: '🪚', cleaner: '🧹' };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --primary: #0D5C63; --primary-dark: #094147; --accent: #00A896; --accent-light: #02C4AC; --warning: #F5A623; --white: #ffffff; --gray-50: #F9FAFB; --gray-100: #F3F4F6; --gray-200: #E5E7EB; --gray-300: #D1D5DB; --gray-400: #9CA3AF; --gray-500: #6B7280; --gray-600: #4B5563; --gray-700: #374151; --gray-800: #1F2937; --gray-900: #111827; --shadow: 0 1px 3px rgba(0,0,0,0.1); --shadow-md: 0 4px 6px rgba(0,0,0,0.1); --shadow-lg: 0 10px 15px rgba(0,0,0,0.1); --radius: 8px; --radius-lg: 12px; --radius-xl: 16px; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--gray-50); color: var(--gray-800); line-height: 1.6; -webkit-font-smoothing: antialiased; }
        
        .header { background: var(--white); border-bottom: 1px solid var(--gray-200); position: sticky; top: 0; z-index: 100; }
        .header-inner { max-width: 1280px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
        .logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
        .logo-text { font-size: 1.35rem; font-weight: 700; color: var(--primary-dark); }
        .logo-text span { color: var(--accent); }
        .btn-back { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--gray-600); text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .btn-back:hover { color: var(--primary); }
        
        .hero { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); padding: 3rem 2rem; color: var(--white); }
        .hero-content { max-width: 1280px; margin: 0 auto; display: flex; gap: 2.5rem; align-items: center; }
        .logo-container { width: 130px; height: 130px; background: var(--white); border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: var(--shadow-lg); flex-shrink: 0; }
        .logo-container img { width: 100%; height: 100%; object-fit: cover; }
        .logo-placeholder { font-size: 3.5rem; }
        .contractor-info { flex: 1; }
        .contractor-category { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.2); padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.875rem; margin-bottom: 0.75rem; font-weight: 500; }
        .contractor-name { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.5rem; }
        .contractor-rating { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; margin-bottom: 0.75rem; }
        .stars { color: var(--warning); letter-spacing: 2px; }
        .review-count { color: rgba(255,255,255,0.85); font-size: 0.95rem; }
        .contractor-location { color: rgba(255,255,255,0.9); font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        
        .action-bar { background: var(--white); padding: 1.5rem 2rem; border-bottom: 1px solid var(--gray-200); box-shadow: var(--shadow); }
        .action-bar-inner { max-width: 1280px; margin: 0 auto; display: flex; gap: 1rem; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.75rem; border-radius: var(--radius); font-weight: 600; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s; font-size: 1rem; }
        .btn-primary { background: var(--accent); color: var(--white); }
        .btn-primary:hover { background: var(--accent-light); transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .btn-secondary { background: var(--gray-100); color: var(--gray-700); }
        .btn-secondary:hover { background: var(--gray-200); }
        
        .content { max-width: 1280px; margin: 0 auto; padding: 2.5rem 2rem; display: grid; grid-template-columns: 1fr 380px; gap: 2rem; }
        .section { background: var(--white); border-radius: var(--radius-xl); padding: 1.75rem; box-shadow: var(--shadow); border: 1px solid var(--gray-200); }
        .section-title { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--gray-800); display: flex; align-items: center; gap: 0.5rem; }
        
        .review-card { padding: 1.25rem; border: 1px solid var(--gray-200); border-radius: var(--radius-lg); margin-bottom: 1rem; transition: all 0.2s; }
        .review-card:hover { border-color: var(--accent-light); box-shadow: var(--shadow-sm); }
        .review-card:last-child { margin-bottom: 0; }
        .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .review-author { font-weight: 600; color: var(--gray-800); }
        .review-date { font-size: 0.85rem; color: var(--gray-500); }
        .review-rating { color: var(--warning); font-size: 0.95rem; letter-spacing: 1px; margin-bottom: 0.5rem; }
        .review-content { color: var(--gray-600); font-size: 0.95rem; line-height: 1.6; }
        .no-reviews { color: var(--gray-500); text-align: center; padding: 2rem; font-size: 1rem; }
        
        .sidebar { display: flex; flex-direction: column; gap: 1.25rem; }
        .contact-card { background: var(--white); border-radius: var(--radius-xl); padding: 1.75rem; box-shadow: var(--shadow); border: 1px solid var(--gray-200); }
        .contact-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: var(--gray-800); }
        .contact-row { display: flex; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--gray-100); }
        .contact-row:last-child { border-bottom: none; padding-bottom: 0; }
        .contact-icon { width: 44px; height: 44px; background: linear-gradient(135deg, var(--gray-100), var(--gray-200)); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .contact-info { min-width: 0; }
        .contact-label { font-size: 0.8rem; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; }
        .contact-value { font-weight: 600; color: var(--gray-800); font-size: 0.95rem; word-break: break-word; }
        
        .map-card { background: var(--white); border-radius: var(--radius-xl); padding: 1.75rem; box-shadow: var(--shadow); border: 1px solid var(--gray-200); }
        .map-placeholder { background: linear-gradient(135deg, var(--gray-100), var(--gray-200)); border-radius: var(--radius-lg); height: 180px; display: flex; align-items: center; justify-content: center; color: var(--gray-500); font-size: 0.95rem; }
        
        footer { background: var(--gray-900); color: var(--gray-400); padding: 2rem; text-align: center; font-size: 0.9rem; }
        footer a { color: var(--gray-300); text-decoration: none; }
        
        @media (max-width: 1024px) { .content { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .hero-content { flex-direction: column; text-align: center; gap: 1.5rem; } .contractor-name { font-size: 1.75rem; } .action-bar-inner { justify-content: center; } }
      ` }} />

      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">🏠</div>
            <span className="logo-text">Michigan<span>Contractors</span></span>
          </Link>
          <Link href="/" className="btn-back">← Back to Directory</Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="logo-container">
            <span className="logo-placeholder">{categoryIcons[contractor.category] || '🏢'}</span>
          </div>
          <div className="contractor-info">
            <div className="contractor-category">{categoryIcons[contractor.category] || '🏢'} {contractor.category}</div>
            <h1 className="contractor-name">{contractor.name}</h1>
            <div className="contractor-rating">
              <span className="stars">{'★'.repeat(Math.floor(contractor.rating))}</span>
              <span>{contractor.rating.toFixed(1)}</span>
              <span className="review-count">({contractor.review_count} reviews)</span>
            </div>
            <div className="contractor-location">📍 {contractor.address}, {contractor.city}, {contractor.state} {contractor.zip_code}</div>
          </div>
        </div>
      </section>

      <div className="action-bar">
        <div className="action-bar-inner">
          <a href={`tel:${contractor.phone}`} className="btn btn-primary">📞 Call Now</a>
          {contractor.website && contractor.website.length > 0 && <a href={contractor.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">🌐 Website</a>}
          <button className="btn btn-primary" onClick={() => window.location.href = '/#listings'}>📝 Write Review</button>
        </div>
      </div>

      <div className="content">
        <div className="main-content">
          <div className="section">
            <h2 className="section-title">💬 Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to share your experience!</p>
            ) : (
              reviews.map((review) => (
                <div className="review-card" key={review.id}>
                  <div className="review-header">
                    <span className="review-author">{review.author_name}</span>
                    <span className="review-date">{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="review-rating">{'★'.repeat(review.rating)}</div>
                  <p className="review-content">{review.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar">
          <div className="contact-card">
            <h3 className="contact-title">📋 Contact Information</h3>
            <div className="contact-row">
              <div className="contact-icon">📞</div>
              <div className="contact-info"><div className="contact-label">Phone</div><a href={`tel:${contractor.phone}`} className="contact-value">{contractor.phone}</a></div>
            </div>
            <div className="contact-row">
              <div className="contact-icon">📍</div>
              <div className="contact-info"><div className="contact-label">Address</div><div className="contact-value">{contractor.address}</div></div>
            </div>
            <div className="contact-row">
              <div className="contact-icon">🏙️</div>
              <div className="contact-info"><div className="contact-label">City</div><div className="contact-value">{contractor.city}, {contractor.state} {contractor.zip_code}</div></div>
            </div>
          </div>

          <div className="map-card">
            <h3 className="contact-title">🗺️ Location</h3>
            <div className="map-placeholder">📍 {contractor.city}, Michigan</div>
          </div>
        </div>
      </div>

      <footer>
        <p>© 2026 MichiganContractors.com — <a href="#">Privacy</a> · <a href="#">Terms</a></p>
      </footer>
    </>
  );
}