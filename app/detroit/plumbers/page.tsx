import { getContractorsByCity } from '@/lib/contractors';

export const metadata = {
  title: 'Plumbers in Detroit, MI | Trusted & Verified',
  description: 'Find the best plumbers in Detroit, Michigan. Verified reviews, contact info, and free quotes from top-rated plumbing companies.',
};

export default async function DetroitPlumbers() {
  const contractors = await getContractorsByCity('Detroit', 'plumber');

  return (
    <div className="container">
      <div className="city-header">
        <h1>Plumbers in Detroit, MI</h1>
        <p>Find trusted, verified plumbers in Detroit</p>
      </div>
      
      <div className="contractor-list">
        {contractors.map((c: any) => (
          <div key={c.id} className="contractor-card">
            <h2>{c.name}</h2>
            <p className="category">{c.category}</p>
            <p className="address">{c.address}, {c.city}, {c.state} {c.zip_code}</p>
            <p className="phone">{c.phone}</p>
            <div className="rating">⭐ {c.rating} ({c.review_count} reviews)</div>
          </div>
        ))}
      </div>
    </div>
  );
}