import type { Metadata } from 'next';
import Schema from '../../components/Schema';

export const metadata: Metadata = {
  title: 'Plumbers in Detroit, MI | Trusted & Verified',
  description: 'Find trusted plumbers in Detroit, MI. Verified reviews, free quotes, and reliable plumbing services near you.',
  keywords: 'plumbers in Detroit, Detroit MI plumbers, plumbing services Detroit, emergency plumber Detroit',
  openGraph: {
    title: 'Plumbers in Detroit, MI | Trusted & Verified',
    description: 'Find trusted plumbers in Detroit, MI. Verified reviews and free quotes.',
    type: 'website',
  },
};

const contractors = [
  { name: 'Detroit Plumbing Co.', rating: 4.8, reviews: 234, phone: '(313) 555-0101', address: '1234 Woodward Ave, Detroit, MI' },
  { name: 'Motor City Plumbers', rating: 4.6, reviews: 189, phone: '(313) 555-0102', address: '5678 Gratiot Ave, Detroit, MI' },
  { name: 'Great Lakes Plumbing', rating: 4.9, reviews: 312, phone: '(313) 555-0103', address: '910 Michigan Ave, Detroit, MI' },
];

export default function DetroitPlumbers() {
  return (
    <>
      <Schema />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui' }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1f2937' }}>Plumbers in Detroit, MI</h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Verified contractors with honest reviews</p>
        </header>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {contractors.map((c, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>{c.name}</h2>
              <p style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>
                {'★'.repeat(Math.floor(c.rating))} {c.rating} ({c.reviews} reviews)
              </p>
              <p style={{ color: '#4b5563', marginBottom: '0.5rem' }}>📍 {c.address}</p>
              <p style={{ color: '#2563eb', fontWeight: '600' }}>📞 {c.phone}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Need a different service?</p>
          <a href="/" style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
            Search All Contractors
          </a>
        </div>
      </div>
    </>
  );
}
