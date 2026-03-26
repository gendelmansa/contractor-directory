import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

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
  website: string;
  logo: string;
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
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data } = await supabase
    .from('contractors')
    .select('id, name, category, address, city, state, zip_code, rating, review_count, phone, website, logo')
    .eq('id', id)
    .single();
    
  return data;
}

async function getReviews(id: string): Promise<Review[]> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('contractor_id', parseInt(id))
    .order('created_at', { ascending: false })
    .limit(10);
    
  return data || [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const contractor = await getContractor(id);
  
  if (!contractor) {
    return { title: 'Contractor Not Found' };
  }
  
  return {
    title: `${contractor.name} | Michigan Contractors`,
    description: `${contractor.name} - ${contractor.category} in ${contractor.city}, Michigan. Rating: ${contractor.rating}/5`,
  };
}

export default async function ContractorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contractor = await getContractor(id);
  
  if (!contractor) {
    notFound();
  }
  
  const reviews = await getReviews(id);
  
  const categoryIcons: Record<string, string> = {
    plumber: '🔧',
    electrician: '⚡',
    hvac: '❄️',
    roofer: '🏗️',
    landscaper: '🌳',
    painter: '🎨',
    carpenter: '🪚',
    cleaner: '🧹',
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --primary: #0f172a; --primary-light: #1e293b; --accent: #3b82f6; --accent-hover: #2563eb; --warning: #f59e0b; --gray-50: #f8fafc; --gray-100: #f1f5f9; --gray-200: #e2e8f0; --gray-500: #64748b; --gray-600: #475569; --gray-700: #334155; --gray-800: #1e293b; --gray-900: #0f172a; --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1); --radius: 16px; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: var(--gray-50); color: var(--gray-800); line-height: 1.6; }
        nav { background: white; border-bottom: 1px solid var(--gray-200); position: sticky; top: 0; z-index: 100; }
        .nav-inner { max-width: 1200px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
        .logo-icon { width: 40px; height: 40px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; }
        .btn-back { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--gray-600); text-decoration: none; font-weight: 500; }
        .btn-back:hover { color: var(--accent); }
        .hero { background: linear-gradient(135deg, var(--primary), var(--primary-light)); padding: 3rem 2rem; color: white; }
        .hero-content { max-width: 1200px; margin: 0 auto; display: flex; gap: 2rem; align-items: center; }
        .logo-container { width: 120px; height: 120px; background: white; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: var(--shadow-lg); }
        .logo-container img { width: 100%; height: 100%; object-fit: cover; }
        .logo-placeholder { font-size: 3rem; }
        .contractor-info { flex: 1; }
        .contractor-name { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .contractor-category { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; margin-bottom: 1rem; }
        .contractor-rating { display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem; }
        .stars { color: var(--warning); }
        .review-count { color: rgba(255,255,255,0.8); font-size: 0.875rem; }
        .contractor-location { color: rgba(255,255,255,0.9); margin-top: 0.5rem; }
        .action-bar { background: white; padding: 1.5rem 2rem; border-bottom: 1px solid var(--gray-200); }
        .action-bar-inner { max-width: 1200px; margin: 0 auto; display: flex; gap: 1rem; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
        .btn-primary { background: var(--accent); color: white; }
        .btn-primary:hover { background: var(--accent-hover); }
        .btn-secondary { background: var(--gray-100); color: var(--gray-700); }
        .btn-secondary:hover { background: var(--gray-200); }
        .content { max-width: 1200px; margin: 0 auto; padding: 2rem; display: grid; grid-template-columns: 1fr 350px; gap: 2rem; }
        .section { background: white; border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow); }
        .section-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .review-card { padding: 1rem; border: 1px solid var(--gray-200); border-radius: 12px; margin-bottom: 1rem; }
        .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .review-author { font-weight: 600; }
        .review-date { font-size: 0.75rem; color: var(--gray-500); }
        .review-rating { color: var(--warning); }
        .review-content { color: var(--gray-600); font-size: 0.9rem; }
        .no-reviews { color: var(--gray-500); text-align: center; padding: 2rem; }
        .sidebar { display: flex; flex-direction: column; gap: 1rem; }
        .contact-card { background: white; border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow); }
        .contact-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--gray-100); }
        .contact-row:last-child { border-bottom: none; }
        .contact-icon { width: 40px; height: 40px; background: var(--gray-100); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .contact-label { font-size: 0.75rem; color: var(--gray-500); }
        .contact-value { font-weight: 500; }
        .map-card { background: white; border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow); }
        .map-placeholder { background: var(--gray-100); border-radius: 12px; height: 150px; display: flex; align-items: center; justify-content: center; color: var(--gray-500); }
        footer { background: var(--gray-900); color: var(--gray-500); padding: 2rem; text-align: center; margin-top: 3rem; }
        @media (max-width: 768px) { .content { grid-template-columns: 1fr; } .hero-content { flex-direction: column; text-align: center; } }
      ` }} />

      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <span className="logo-icon">🏠</span>
            MichiganContractors
          </Link>
          <Link href="/" className="btn-back">← Back to Directory</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="logo-container">
            {contractor.logo ? (
              <img src={contractor.logo} alt={`${contractor.name} logo`} />
            ) : (
              <span className="logo-placeholder">{categoryIcons[contractor.category] || '🏢'}</span>
            )}
          </div>
          <div className="contractor-info">
            <div className="contractor-category">
              {categoryIcons[contractor.category] || '🏢'} {contractor.category}
            </div>
            <h1 className="contractor-name">{contractor.name}</h1>
            <div className="contractor-rating">
              <span className="stars">{'★'.repeat(Math.floor(contractor.rating))}</span>
              {contractor.rating.toFixed(1)}
              <span className="review-count">({contractor.review_count} reviews)</span>
            </div>
            <div className="contractor-location">
              📍 {contractor.address}, {contractor.city}, {contractor.state} {contractor.zip_code}
            </div>
          </div>
        </div>
      </section>

      <div className="action-bar">
        <div className="action-bar-inner">
          <a href={`tel:${contractor.phone}`} className="btn btn-primary">📞 Call Now</a>
          {contractor.website && (
            <a href={contractor.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">🌐 Website</a>
          )}
        </div>
      </div>

      <div className="content">
        <div className="main-content">
          <div className="section">
            <h2 className="section-title">💬 Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to leave a review!</p>
            ) : (
              reviews.map((review) => (
                <div className="review-card" key={review.id}>
                  <div className="review-header">
                    <span className="review-author">{review.author_name}</span>
                    <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
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
            <h3 className="section-title">📋 Contact Info</h3>
            <div className="contact-row">
              <div className="contact-icon">📞</div>
              <div>
                <div className="contact-label">Phone</div>
                <div className="contact-value">{contractor.phone}</div>
              </div>
            </div>
            <div className="contact-row">
              <div className="contact-icon">📍</div>
              <div>
                <div className="contact-label">Address</div>
                <div className="contact-value">{contractor.address}</div>
              </div>
            </div>
            <div className="contact-row">
              <div className="contact-icon">🏙️</div>
              <div>
                <div className="contact-label">City</div>
                <div className="contact-value">{contractor.city}, {contractor.state}</div>
              </div>
            </div>
          </div>

          <div className="map-card">
            <h3 className="section-title">🗺️ Location</h3>
            <div className="map-placeholder">
              Map view coming soon
            </div>
          </div>
        </div>
      </div>

      <footer>
        <p>© 2026 MichiganContractors.com</p>
      </footer>
    </>
  );
}