const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Contractor Directory',
  description: 'Find trusted contractors near you. Search verified plumbers, electricians, HVAC pros, roofers & more.',
  areaServed: 'United States',
  serviceType: ['Plumbing', 'Electrical', 'HVAC', 'Roofing'],
  url: 'https://contractor-directory-sand.vercel.app',
};

export default function Schema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
