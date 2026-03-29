import Link from 'next/link';

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: 'white', padding: '1rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none', color: '#2563eb' }}>
          🔨 MichiganContractors.com
        </Link>
      </header>
      <main style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>About Us</h1>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            MichiganContractors.com is your trusted resource for finding licensed, reliable contractors across Michigan. 
            We connect homeowners and businesses with quality contractors in their area.
          </p>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
            Our platform features verified contractor listings, real reviews, and an easy way to submit service requests.
            Whether you need a plumber, electrician, roofer, or handyman — we've got you covered.
          </p>
          <p style={{ marginTop: '2rem', color: '#6b7280' }}>
            <Link href="/" style={{ color: '#2563eb' }}>← Back to Home</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
